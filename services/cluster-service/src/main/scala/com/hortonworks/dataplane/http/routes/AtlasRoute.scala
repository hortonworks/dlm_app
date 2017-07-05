package com.hortonworks.dataplane.http.routes

import java.util.concurrent.TimeUnit
import javax.inject.{Inject, Singleton}

import akka.http.scaladsl.model.{HttpRequest, StatusCodes}
import akka.http.scaladsl.server.Directives._
import com.google.common.base.Supplier
import com.google.common.cache.{CacheBuilder, CacheLoader, LoadingCache}
import com.hortonworks.dataplane.commons.domain.Constants
import com.hortonworks.dataplane.commons.domain.Entities.HJwtToken
import com.hortonworks.dataplane.cs.atlas.{AtlasApiData, AtlasInterface, DefaultAtlasInterface}
import com.hortonworks.dataplane.cs.atlas.AtlasInterface
import com.hortonworks.dataplane.http.BaseRoute
import com.typesafe.config.Config
import com.typesafe.scalalogging.Logger
import org.apache.atlas.AtlasServiceException
import org.apache.atlas.model.SearchFilter
import play.api.libs.json.JsValue

import scala.concurrent.Future
import scala.util.{Failure, Success, Try}

@Singleton
class AtlasRoute @Inject()(private val config: Config,private val atlasApiData: AtlasApiData)
    extends BaseRoute {

  import com.hortonworks.dataplane.commons.domain.Atlas._
  import com.hortonworks.dataplane.http.JsonSupport._

  // Endpoints don't change too often, Cache the API
  // not hit the database too often
  lazy val atlasApiCacheTime =
    Try(config.getInt("dp.services.cluster.http.atlas.token.cache.secs"))
      .getOrElse(600)
  val logger = Logger(classOf[AtlasRoute])


  private class InterfaceCacheLoader extends CacheLoader[Long,AtlasInterface]{
    override def load(key: Long): AtlasInterface = {
      getInterface(key)
    }
  }

  // A map of cluster<->Supplier
  // Do not remove the cast or the compiler will throw up
  private val atlasInterfaceCache = CacheBuilder
    .newBuilder()
    .expireAfterAccess(atlasApiCacheTime, TimeUnit.SECONDS)
    .build(new InterfaceCacheLoader()).asInstanceOf[LoadingCache[Long,AtlasInterface]]

  val hiveAttributes =
    path("cluster" / LongNumber / "atlas" / "hive" / "attributes") { id =>
      extractRequest { request =>
        get {
          implicit val token = extractToken(request)
          val attributes = atlasInterfaceCache.get(id).getHiveAttributes
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
            implicit val token = extractToken(request)
            val atlasEntities = atlasInterfaceCache.get(id).findHiveTables(filters)
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
          implicit val token = extractToken(request)
          val eventualValue = atlasInterfaceCache.get(id).getAtlasEntity(uuid)
          handleResponse(eventualValue)
        }
      }
  }

  val atlasEntities = path("cluster" / LongNumber / "atlas" / "guid") { id =>
    pathEndOrSingleSlash {
      extractRequest { request =>
        parameters('query.*) { uuids =>
          get {
            implicit val token = extractToken(request)
            val eventualValue = atlasInterfaceCache.get(id).getAtlasEntities(uuids)
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
                implicit val token = extractToken(request)
                val eventualValue =
                  atlasInterfaceCache.get(cluster).getAtlasLineage(guid, depth)
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
            implicit val token = extractToken(request)
            val typeDefs = atlasInterfaceCache.get(cluster).getAtlasTypeDefs(searchFilter)
            onComplete(typeDefs) {
              case Success(typeDefs) => complete(success(typeDefs))
              case Failure(th) =>
                complete(StatusCodes.InternalServerError, errors(th))
            }
          }
        }
    }

  private def getInterface(id: Long): AtlasInterface = {
    supplyApi(id).get()
  }

  private def extractToken(httpRequest: HttpRequest):Option[HJwtToken] = {
    val tokenHeader = httpRequest.getHeader(Constants.DPTOKEN)
    if (tokenHeader.isPresent) Some(HJwtToken(tokenHeader.get().value())) else None
  }

  private def supplyApi(id: Long) = {
    new AtlasInterfaceSupplier(id,config,atlasApiData)
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
  def apply(config: Config,atlasApiData: AtlasApiData): AtlasRoute =
    new AtlasRoute(config,atlasApiData)
}

private[http] class AtlasInterfaceSupplier(
    clusterId: Long,
    config: Config,atlasApiData:AtlasApiData)
    extends Supplier[AtlasInterface] {

  override def get(): AtlasInterface = {
    new DefaultAtlasInterface(clusterId,config,atlasApiData)
  }
}
