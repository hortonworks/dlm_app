package com.hortonworks.dataplane.http.routes

import java.util.concurrent.TimeUnit
import javax.inject.{Inject, Singleton}

import akka.http.scaladsl.model.StatusCodes
import akka.http.scaladsl.server.Directives._
import com.google.common.base.{Supplier, Suppliers}
import com.hortonworks.dataplane.cs.{
  AtlasInterface,
  DefaultAtlasInterface,
  StorageInterface
}
import com.hortonworks.dataplane.db.Webserice.{
  ClusterComponentService,
  ClusterHostsService
}
import com.hortonworks.dataplane.http.BaseRoute
import com.typesafe.config.Config
import com.typesafe.scalalogging.Logger
import org.apache.atlas.AtlasServiceException

import scala.util.{Failure, Success, Try}

@Singleton
class AtlasRoute @Inject()(
    private val storageInterface: StorageInterface,
    private val clusterComponentService: ClusterComponentService,
    private val clusterHostsService: ClusterHostsService,
    private val config: Config)
    extends BaseRoute {

  import java.util.concurrent.ConcurrentHashMap

  import com.hortonworks.dataplane.commons.domain.Atlas._
  import com.hortonworks.dataplane.http.JsonSupport._

  import scala.collection.JavaConverters._

  val logger = Logger(classOf[AtlasRoute])

  val atlasInterfaceCache =
    new ConcurrentHashMap[Long, Supplier[AtlasInterface]]().asScala

  // Endpoints don't change too often, Cache the API for handling service disruptions and
  // not hit the database too often
  lazy val atlasApiCacheTime =
    Try(config.getLong("dp.services.cluster.http.atlas.endpoint.cache.secs"))
      .getOrElse(60L)

  private def getInterface(id: Long): AtlasInterface = {
    atlasInterfaceCache
      .getOrElseUpdate(
        id,
        supplyApi(id)
      )
      .get()
  }

  val hiveAttributes =
    path("cluster" / LongNumber / "atlas" / "hive" / "attributes") { id =>
      get {
        val attributes = getInterface(id).getHiveAttributes
        onComplete(attributes) {
          case Success(attributes) => complete(success(attributes))
          case Failure(th) =>
            complete(StatusCodes.InternalServerError, errors(th))
        }
      }
    }

  val hiveTables = {
    path("cluster" / LongNumber / "atlas" / "hive" / "search") { id =>
      post {
        entity(as[AtlasFilters]) { filters =>
          val atlasEntities = getInterface(id).findHiveTables(filters)
          onComplete(atlasEntities) {
            case Success(entities) => complete(success(entities))
            case Failure(th) =>
              complete(StatusCodes.InternalServerError, errors(th))
          }
        }
      }
    }
  }

  val atlasEntity = path("cluster" / LongNumber / "atlas" / "guid" / Segment) {
    (id, uuid) =>
      get {
        val eventualValue = getInterface(id).getAtlasEntity(uuid)
        onComplete(eventualValue) {
          case Success(entities) => complete(success(entities))
          case Failure(th) =>
            th match {
              case exception: AtlasServiceException =>
                complete(exception.getStatus.getStatusCode, errors(th))
              case _ => complete(StatusCodes.InternalServerError, errors(th))
            }
        }
      }
  }

  val atlasEntities = path("cluster" / LongNumber / "atlas" / "guid") { id =>
    pathEndOrSingleSlash {
      parameters('query.*) { uuids =>
        get {
          val eventualValue = getInterface(id).getAtlasEntities(uuids)
          onComplete(eventualValue) {
            case Success(entities) => complete(success(entities))
            case Failure(th) =>
              th match {
                case exception: AtlasServiceException =>
                  complete(exception.getStatus.getStatusCode, errors(th))
                case _ => complete(StatusCodes.InternalServerError, errors(th))
              }
          }
        }
      }
    }
  }

  private def supplyApi(id: Long) = {
    Suppliers.memoizeWithExpiration(newInterface(id),
                                    atlasApiCacheTime,
                                    TimeUnit.SECONDS)
  }

  private def newInterface(id: Long) = {
    new AtlasInterfaceSupplier(storageInterface,
                               clusterComponentService,
                               clusterHostsService,
                               id,
                               config)
  }
}

object AtlasRoute {
  def apply(storageInterface: StorageInterface,
            clusterService: ClusterComponentService,
            clusterHostsService: ClusterHostsService,
            config: Config): AtlasRoute =
    new AtlasRoute(storageInterface,
                   clusterService,
                   clusterHostsService,
                   config)
}

private[http] class AtlasInterfaceSupplier(
    storageInterface: StorageInterface,
    clusterComponentService: ClusterComponentService,
    clusterHostsService: ClusterHostsService,
    clusterId: Long,
    config: Config)
    extends Supplier[AtlasInterface] {

  override def get(): AtlasInterface = {
    new DefaultAtlasInterface(clusterId,
                              storageInterface,
                              clusterComponentService,
                              clusterHostsService,
                              config)
  }
}
