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

import javax.inject.{Inject, Singleton}

import akka.http.scaladsl.model.{HttpRequest, StatusCodes}
import akka.http.scaladsl.server.Directives._
import com.hortonworks.dataplane.CSConstants
import com.hortonworks.dataplane.commons.domain.Constants
import com.hortonworks.dataplane.commons.domain.Entities.{Errors, HJwtToken, WrappedErrorException}
import com.hortonworks.dataplane.commons.domain.JsonFormatters._
import com.hortonworks.dataplane.cs.{ClusterDataApi, CredentialInterface}
import com.hortonworks.dataplane.cs.atlas.AtlasService
import com.hortonworks.dataplane.http.BaseRoute
import com.typesafe.config.Config
import com.typesafe.scalalogging.Logger
import play.api.libs.json.{JsValue, Json}

import scala.concurrent.Future
import scala.util.{Failure, Success}

@Singleton
class AtlasRoute @Inject()(config: Config, atlas: AtlasService, clusterDataApi: ClusterDataApi, credentialInterface: CredentialInterface)
    extends BaseRoute {

  import com.hortonworks.dataplane.commons.domain.Atlas._
  import com.hortonworks.dataplane.http.JsonSupport._

  val logger = Logger(classOf[AtlasRoute])

  val hiveAttributes =
    path("cluster" / Segment / "atlas" / "hive" / "attributes") { clusterId =>
      extractRequest { request =>
        get {
          implicit val token = extractToken(request)
          onComplete(
            for {
              urls <- clusterDataApi.getAtlasUrl(clusterId.toLong)
              cred <- credentialInterface.getCredential(CSConstants.ATLAS_CREDENTIAL_KEY)
              res <- atlas.getEntityTypes(urls, clusterId, cred.user.getOrElse("admin"), cred.pass.getOrElse("admin"), "hive_table")
            } yield res
          ) {
            case Success(att) => complete(success(att))
            case Failure(th) => complete(StatusCodes.InternalServerError, errors(500, "cluster.atlas.generic", "A generic error occured while communicating with Atlas.", th))
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
            onComplete(
              for {
                urls <- clusterDataApi.getAtlasUrl(clusterId.toLong)
                cred <- credentialInterface.getCredential(CSConstants.ATLAS_CREDENTIAL_KEY)
                res <- atlas.query(urls, clusterId, cred.user.getOrElse("admin"), cred.pass.getOrElse("admin"), query)
              } yield res
            ) {
              case Success(entities) => complete(success(entities))
              case Failure(th) =>
                th match {
                  case ex: WrappedErrorException => complete(ex.error.status -> Json.toJson(Errors(Seq(ex.error))))
                  case _ => complete(StatusCodes.InternalServerError, errors(500, "cluster.atlas.generic", "A generic error occured while communicating with Atlas.", th))
                }
            }
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
          handleResponse(
            for {
              urls <- clusterDataApi.getAtlasUrl(clusterId.toLong)
              cred <- credentialInterface.getCredential(CSConstants.ATLAS_CREDENTIAL_KEY)
              res <- atlas.getEntity(urls, clusterId, cred.user.getOrElse("admin"), cred.pass.getOrElse("admin"), guid)
            } yield res
          )
        }
      }
  }

  val atlasEntities = path("cluster" / Segment / "atlas" / "guid") { clusterId =>
    pathEndOrSingleSlash {
      extractRequest { request =>
        parameters('query.*) { guids =>
          get {
            implicit val token = extractToken(request)
            handleResponse(
              for {
                urls <- clusterDataApi.getAtlasUrl(clusterId.toLong)
                cred <- credentialInterface.getCredential(CSConstants.ATLAS_CREDENTIAL_KEY)
                res <- atlas.getEntities(urls, clusterId, cred.user.getOrElse("admin"), cred.pass.getOrElse("admin"), guids.toList)
              } yield res
            )
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
                onComplete(
                  for {
                    urls <- clusterDataApi.getAtlasUrl(clusterId.toLong)
                    cred <- credentialInterface.getCredential(CSConstants.ATLAS_CREDENTIAL_KEY)
                    res <- atlas.getLineage(urls, clusterId, cred.user.getOrElse("admin"), cred.pass.getOrElse("admin"), guid, depth)
                  } yield res
                ) {
                  case Success(entities) => complete(success(entities))
                  case Failure(th) =>
                    th match {
                      case ex: WrappedErrorException => complete(ex.error.status -> Json.toJson(Errors(Seq(ex.error))))
                      case _ => complete(StatusCodes.InternalServerError, errors(500, "cluster.atlas.generic", "A generic error occured while communicating with Atlas.", th))
                    }
                }
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
            onComplete(
              for {
                urls <- clusterDataApi.getAtlasUrl(clusterId.toLong)
                cred <- credentialInterface.getCredential(CSConstants.ATLAS_CREDENTIAL_KEY)
                res <- atlas.getTypes(urls, clusterId, cred.user.getOrElse("admin"), cred.pass.getOrElse("admin"), typeDef)
              } yield res
            ) {
              case Success(typeDefs) => complete(success(typeDefs))
              case Failure(th) => complete(StatusCodes.InternalServerError, errors(500, "cluster.atlas.generic", "A generic error occured while communicating with Atlas.", th))
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
          case ex: WrappedErrorException => complete(ex.error.status -> Json.toJson(Errors(Seq(ex.error))))
          case _ => complete(StatusCodes.InternalServerError, errors(500, "cluster.atlas.generic", "A generic error occured while communicating with Atlas.", th))
        }
    }
  }
}