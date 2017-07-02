package com.hortonworks.dataplane.http.routes

import java.util.concurrent.TimeUnit
import javax.inject.{Inject, Singleton}

import akka.http.scaladsl.model.{HttpRequest, StatusCodes}
import akka.http.scaladsl.server.Directives._
import com.google.common.base.{Supplier, Suppliers}
import com.google.common.cache.{Cache, CacheBuilder, CacheLoader}
import com.hortonworks.dataplane.commons.domain.Constants
import com.hortonworks.dataplane.commons.domain.Entities.HJwtToken
import com.hortonworks.dataplane.cs.{AtlasInterface, DefaultAtlasInterface, StorageInterface}
import com.hortonworks.dataplane.db.Webservice.{ClusterComponentService, ClusterHostsService}
import com.hortonworks.dataplane.http.BaseRoute
import com.typesafe.config.Config
import com.typesafe.scalalogging.Logger
import org.apache.atlas.AtlasServiceException
import org.apache.atlas.model.SearchFilter
import play.api.libs.json.JsValue

import scala.concurrent.Future
import scala.util.{Failure, Success, Try}

@Singleton
class AtlasRoute @Inject()(private val config: Config)
    extends BaseRoute {

  import java.util.concurrent.ConcurrentHashMap

  import com.hortonworks.dataplane.commons.domain.Atlas._
  import com.hortonworks.dataplane.http.JsonSupport._

  import scala.collection.JavaConverters._

  private case class CacheKey(clusterId:Long,token:Option[HJwtToken])
  // Endpoints don't change too often, Cache the API for handling service disruptions and
  // not hit the database too often
  lazy val atlasApiCacheTime =
    Try(config.getInt("dp.services.cluster.http.atlas.token.cache.secs"))
      .getOrElse(600)
  val logger = Logger(classOf[AtlasRoute])


  private class InterfaceCacheLoader extends CacheLoader[CacheKey,AtlasInterface]{
    override def load(key: CacheKey): AtlasInterface = {
      getInterface(key.clusterId,key.token)
    }
  }

  // A static map of cluster+token<->Supplier
  private val atlasInterfaceCache = CacheBuilder
    .newBuilder()
    .expireAfterAccess(atlasApiCacheTime, TimeUnit.SECONDS)
    .build(new InterfaceCacheLoader())

  val hiveAttributes =
    path("cluster" / LongNumber / "atlas" / "hive" / "attributes") { id =>
      extractRequest { request =>
        get {
          val attributes = atlasInterfaceCache.get(CacheKey(id,extractToken(request))).getHiveAttributes
          onComplete(attributes) {
            case Success(attributes) => complete(success(attributes))
            case Failure(th) =>
              complete(StatusCodes.InternalServerError, errors(th))
          }
        }
      }
    }

  val hiveTables = {
    path("cluster" / LongNumber / "atlas" / "hive" / "search") { id =>
      extractRequest { request =>
        post {
          entity(as[AtlasSearchQuery]) { filters =>
            val atlasEntities = atlasInterfaceCache.get(CacheKey(id,extractToken(request))).findHiveTables(filters)
            onComplete(atlasEntities) {
              case Success(entities) => complete(success(entities))
              case Failure(th) =>
                complete(StatusCodes.InternalServerError, errors(th))
            }
          }
        }
      }
    }
  }

  val atlasEntity = path("cluster" / LongNumber / "atlas" / "guid" / Segment) {
    (id, uuid) =>
      extractRequest { request =>
        get {
          val eventualValue = atlasInterfaceCache.get(CacheKey(id,extractToken(request))).getAtlasEntity(uuid)
          handleResponse(eventualValue)
        }
      }
  }

  val atlasEntities = path("cluster" / LongNumber / "atlas" / "guid") { id =>
    pathEndOrSingleSlash {
      extractRequest { request =>
        parameters('query.*) { uuids =>
          get {
            val eventualValue = atlasInterfaceCache.get(CacheKey(id,extractToken(request))).getAtlasEntities(uuids)
            handleResponse(eventualValue)
          }
        }
      }
    }
  }

  val atlasLineage =
    path("cluster" / LongNumber / "atlas" / Segment / "lineage") {
      (cluster, guid) =>
        pathEndOrSingleSlash {
          extractRequest { request =>
            parameters("depth".?) { depth =>
              get {
                val eventualValue =
                  atlasInterfaceCache.get(CacheKey(cluster,extractToken(request))).getAtlasLineage(guid, depth)
                handleResponse(eventualValue)

              }
            }
          }
        }
    }

  val atlasTypeDefs =
    path("cluster" / LongNumber / "atlas" / "typedefs" / "type" / Segment) {
      (cluster, typeDef) =>
        extractRequest { request =>
          get {
            val searchFilter = new SearchFilter()
            searchFilter.setParam("type", typeDef)
            val typeDefs = atlasInterfaceCache.get(CacheKey(cluster,extractToken(request))).getAtlasTypeDefs(searchFilter)
            onComplete(typeDefs) {
              case Success(typeDefs) => complete(success(typeDefs))
              case Failure(th) =>
                complete(StatusCodes.InternalServerError, errors(th))
            }
          }
        }
    }

  private def getInterface(id: Long,token:Option[HJwtToken]): AtlasInterface = {
    supplyApi(id,token).get()
  }

  private def extractToken(httpRequest: HttpRequest):Option[HJwtToken] = {
    val tokenHeader = httpRequest.getHeader(Constants.DPTOKEN)
    if (tokenHeader.isPresent) Some(HJwtToken(tokenHeader.get().value())) else None
  }

  private def supplyApi(id: Long,token: Option[HJwtToken]) = {
    new AtlasInterfaceSupplier(id,token,config)
  }


  private def handleResponse(eventualValue: Future[JsValue]) = {
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



object AtlasRoute {
  def apply(config: Config): AtlasRoute =
    new AtlasRoute(config)
}

private[http] class AtlasInterfaceSupplier(
    clusterId: Long,
    token: Option[HJwtToken],
    config: Config)
    extends Supplier[AtlasInterface] {

  override def get(): AtlasInterface = {
    new DefaultAtlasInterface(clusterId,token,config)
  }
}
