/*
 *
 *  * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *  *
 *  * Except as expressly permitted in a written agreement between you or your company
 *  * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 *  * reproduction, modification, redistribution, sharing, lending or other exploitation
 *  * of all or any part of the contents of this software is strictly prohibited.
 *
 */

package com.hortonworks.dataplane.http.routes

import java.util.concurrent.TimeUnit
import javax.inject.{Inject, Singleton}

import akka.http.scaladsl.model.{HttpRequest, StatusCodes}
import akka.http.scaladsl.server.Directives._
import com.hortonworks.dataplane.commons.domain.Constants
import com.hortonworks.dataplane.commons.domain.Entities.{HJwtToken, WrappedErrorException}
import com.hortonworks.dataplane.cs.{ClusterDataApi, CredentialInterface}
import com.hortonworks.dataplane.cs.atlas.{AtlasInterface, AtlasService, DefaultAtlasInterface}
import com.hortonworks.dataplane.http.BaseRoute
import com.typesafe.config.Config
import com.typesafe.scalalogging.Logger
import play.api.libs.json.{JsValue, Json}

import scala.concurrent.Future
import scala.util.{Failure, Success, Try}

@Singleton
class AtlasRoute @Inject()(private val config: Config, private val atlasApiData: ClusterDataApi, private val credentialInterface: CredentialInterface, atlas: AtlasService)
    extends BaseRoute {

  import com.hortonworks.dataplane.commons.domain.Atlas._
  import com.hortonworks.dataplane.http.JsonSupport._

  val logger = Logger(classOf[AtlasRoute])

  val hiveAttributes =
    path("cluster" / Segment / "atlas" / "hive" / "attributes") { clusterId =>
      extractRequest { request =>
        get {
          implicit val token = extractToken(request)
          val attributes = atlas.getEntityTypes(clusterId, "hive_table")
          onComplete(attributes) {
            case Success(att) => complete(success(att))
            case Failure(th) =>
              complete(StatusCodes.InternalServerError, errors(500, "cluster.atlas.generic", "A generic error occured while communicating with Atlas.", th))
          }
        }
      }
    }

  val hiveTables = {
    path("cluster" / Segment / "atlas" / "hive" / "search") { clusterId =>
      extractRequest { request =>
        post {
          entity(as[AtlasSearchQuery]) { query =>
            implicit val token = extractToken(request)
            val eventualValue = atlas.query(clusterId, query)
            handleResponse(eventualValue)
          }
        }
      }
    }
  }

  val atlasEntity = path("cluster" / Segment / "atlas" / "guid" / Segment) {
    (clusterId, guid) =>
      extractRequest { request =>
        get {
          implicit val token = extractToken(request)
          val eventualValue = atlas.getEntity(clusterId, guid)
          handleResponse(eventualValue)
        }
      }
  }

  val atlasEntities = path("cluster" / Segment / "atlas" / "guid") { clusterId =>
    pathEndOrSingleSlash {
      extractRequest { request =>
        parameters('query.*) { guids =>
          get {
            implicit val token = extractToken(request)
            val eventualValue = atlas.getEntities(clusterId, guids.toList)
            handleResponse(eventualValue)
          }
        }
      }
    }
  }

  val atlasLineage =
    path("cluster" / Segment / "atlas" / Segment / "lineage") {
      (clusterId, guid) =>
        pathEndOrSingleSlash {
          extractRequest { request =>
            parameters("depth".?) { depth =>
              get {
                implicit val token = extractToken(request)
                val eventualValue = atlas.getLineage(clusterId, guid, depth)
                handleResponse(eventualValue)
              }
            }
          }
        }
    }

  val atlasTypeDefs =
    path("cluster" / Segment / "atlas" / "typedefs" / "type" / Segment) {
      (clusterId, typeDef) =>
        extractRequest { request =>
          get {
            implicit val token = extractToken(request)
            val typeDefs = atlas.getTypes(clusterId, typeDef)
            onComplete(typeDefs) {
              case Success(typeDefs) => complete(success(typeDefs))
              case Failure(th) =>complete(StatusCodes.InternalServerError, errors(500, "cluster.atlas.generic", "A generic error occured while communicating with Atlas.", th))
            }
          }
        }
    }

  private def extractToken(httpRequest: HttpRequest):Option[HJwtToken] = {
    val tokenHeader = httpRequest.getHeader(Constants.DPTOKEN)
    if (tokenHeader.isPresent) Some(HJwtToken(tokenHeader.get().value())) else None
  }

  private def handleResponse(eventualValue: Future[JsValue]) = {
    onComplete(eventualValue) {
      case Success(entities) => complete(success(entities))
      case Failure(th) =>
        th match {
          case ex: WrappedErrorException => complete(ex.error.status, Json.toJson(ex.error))
          case _ => complete(StatusCodes.InternalServerError, errors(500, "cluster.atlas.generic", "A generic error occured while communicating with Atlas.", th))
        }
    }
  }
}