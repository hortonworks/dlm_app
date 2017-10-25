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

import java.lang.Exception
import java.net.{URI, URL}
import javax.inject.Inject

import akka.http.scaladsl.model.{HttpRequest, StatusCodes}
import akka.http.scaladsl.server.Directives._
import com.google.common.net.HttpHeaders
import com.hortonworks.dataplane.commons.domain.Constants
import com.hortonworks.dataplane.commons.domain.Entities.{DataplaneClusterIdentifier, ErrorType, HJwtToken}
import com.hortonworks.dataplane.commons.metrics.{MetricsRegistry, MetricsReporter}
import com.hortonworks.dataplane.cs.sync.DpClusterSync
import com.hortonworks.dataplane.cs.{ClusterSync, CredentialInterface, StorageInterface}
import com.hortonworks.dataplane.http.BaseRoute
import com.hortonworks.dataplane.knox.Knox.{ApiCall, KnoxApiRequest, KnoxConfig}
import com.hortonworks.dataplane.knox.KnoxApiExecutor
import com.typesafe.config.Config
import com.typesafe.scalalogging.Logger
import play.api.libs.json.Json
import play.api.libs.ws.{WSAuthScheme, WSClient, WSResponse}

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future
import scala.util.{Failure, Success, Try}

private[routes] case class ConnectionError(message: String, cause: Throwable)
    extends Throwable(message, cause)
private[routes] case class UrlError(cause: Throwable)
    extends Throwable("Invalid URL", cause)
private[routes] case class AmbariError(cause: Throwable)
    extends Throwable("Cannot contact Ambari", cause)

class StatusRoute @Inject()(val ws: WSClient,
                            storageInterface: StorageInterface,
                            val credentialInterface: CredentialInterface,
                            val config: Config,
                            clusterSync: ClusterSync,
                            dpClusterSync: DpClusterSync,
                            metricsRegistry: MetricsRegistry)
    extends BaseRoute {

  import com.hortonworks.dataplane.commons.domain.Ambari._
  import com.hortonworks.dataplane.http.JsonSupport._
  import scala.concurrent.duration._

  val logger = Logger(classOf[StatusRoute])

  private lazy val hdInsightErrorContentType = config.getString("dp.service.hdinsight.auth.challenge.contentType")
  private lazy val hdInsightErrorWwwAuth = config.getString("dp.service.hdinsight.auth.challenge.wwwAuthenticate")
  private lazy val hdInsightErrorStatus = config.getInt("dp.service.hdinsight.auth.status")
  private lazy val hdInsightErrorMessage = config.getString("dp.service.hdinsight.auth.response.message")

  val tokenTopologyName = Try(config.getString("dp.services.knox.token.topology"))
    .getOrElse("token")

  metricsRegistry.newGauge("knox.token.topology.name",{() => tokenTopologyName})

  def makeAmbariApiRequest(endpoint: String,
                           ambariResponse: AmbariForbiddenResponse,
                           timeout: Int,
                           request: HttpRequest,
                           ip: String) = {
    // Step 3
    // check if there was a jwtProviderUrl
    ambariResponse.jwtProviderUrl
      .map { providerUrl =>
        logger.info("Ambari expects a jwt token")
        //Extract the SSO URL hostname
        val uri = new URL(providerUrl)
        val knoxUrl = s"${uri.getProtocol}://${uri.getHost}:${uri.getPort}"
        logger.info(s"Knox detected at $knoxUrl")

        // If Ambari indicates a JWT URL and cluster service is configured to pick up
        // expect a separate config group then return with a response which allows
        // the FE to ask the user for her/his Ambari credentials/Knox URL
        // Return again with the username/password to complete the flow

        val expectConfigGroup =
          config.getBoolean("dp.services.knox.token.expect.separate.config")
        val checkCredentials = config.getBoolean(
          "dp.services.knox.token.infer.endpoint.using.credentials")

        expectConfigGroup match {
          case true =>
            Future.successful(
              AmbariCheckResponse(ambariApiCheck = false,
                                  knoxDetected = true,
                                  404,
                                  Some(knoxUrl),
                                  ip,
                                  Json.obj(),
                                  if (checkCredentials) true else false,
                                  if (!checkCredentials) true else false))
          case false =>
            val delegatedRequest =
              ws.url(endpoint).withRequestTimeout(timeout seconds)
            val delegatedApiCall: ApiCall = { req =>
              req.get()
            }

            val tokenInfoHeader = request.getHeader(Constants.DPTOKEN)
            if (!tokenInfoHeader.isPresent) {
              logger.error(
                "Knox was detected, but the caller did not send a JWT token with the request header X-DP-Token-Info")
              throw new RuntimeException(
                "Ambari was Knox protected but no jwt token was sent with the request")
            }
            val tokenHeader = tokenInfoHeader.get.value
            val response =
              KnoxApiExecutor(KnoxConfig(tokenTopologyName, Some(knoxUrl)), ws).execute(
                KnoxApiRequest(delegatedRequest,
                               delegatedApiCall,
                               Some(tokenHeader)))
            response.map { res =>
              res.status match {
                case 200 =>
                  AmbariCheckResponse(ambariApiCheck = true,
                                      knoxDetected = true,
                                      res.status,
                                      Some(knoxUrl),
                                      ip,
                                      res.json)
                case _ =>
                  AmbariCheckResponse(ambariApiCheck = false,
                                      knoxDetected = true,
                                      res.status,
                                      Some(knoxUrl),
                                      ip,
                                      res.json)
              }
            }
        }
      }
      .getOrElse {
        // Fallback to local user
        // Step 4
        for {
          credential <- credentialInterface.getCredential("dp.credential.ambari")
          response <- ws
            .url(endpoint)
            .withAuth(credential.user.get, credential.pass.get, WSAuthScheme.BASIC)
            .withRequestTimeout(timeout seconds)
            .get()
        } yield {
          response.status match {
            case 200 =>
              AmbariCheckResponse(ambariApiCheck = true,
                                  knoxDetected = false,
                                  response.status,
                                  None,
                                  ip,
                                  response.json)
            case _ =>
              AmbariCheckResponse(ambariApiCheck = false,
                                  knoxDetected = false,
                                  response.status,
                                  None,
                                  ip,
                                  response.json)
          }
        }
      }
  }

  /**
    * A routine to check ambari availability
    * Step 1 - Make a call without any Authentication
    * Step 2 - The response should be a 403 with/without a jwtProviderUrl in the response body
    * Step 3 - If there is a jwtProviderUrl present, assume knox and try to use the HJwt token to connect
    * Step 4 - if no jwtProviderUrl in the response body , try to connect using the seeded user
    *
    * @param ep
    * @return
    */
  def checkAmbariAvailability(
      ep: AmbariEndpoint,
      request: HttpRequest): Future[AmbariCheckResponse] = {
    val endpoint = { u: String =>
      s"${u}${Try(config.getString("dp.service.ambari.cluster.api.prefix")).getOrElse("/api/v1/clusters")}"
    }
    val timeout =
      Try(config.getInt("dp.service.ambari.status.check.timeout.secs"))
        .getOrElse(20)

    //Step 1
    val initialRequest = { eps: String =>
      ws.url(eps)
        .withRequestTimeout(timeout seconds)
        .get()
        .map(mapAsUnauthenticatedResponse)
        .recoverWith {
          case th: Exception =>
            Future.failed(
              ConnectionError(s"Cannot connect to Ambari url at ${endpoint(ep.url)}",
                              th))
        }

    }

    for {
      ip <- getAmbariUrl(ep.url)
      ambariResponse <- initialRequest(endpoint(ep.url))
      //Step 3
      ambariApiResponse <- makeAmbariApiRequest(endpoint(ep.url),
                                                ambariResponse,
                                                timeout,
                                                request,
                                                ip).recoverWith {
        case th: Throwable => Future.failed(AmbariError(th))
      }
    } yield ambariApiResponse

  }

  private def mapAsUnauthenticatedResponse(
      response: WSResponse): AmbariForbiddenResponse = {
      response.status match {
        case 403 => response.json.validate[AmbariForbiddenResponse].get
        case x if x == hdInsightErrorStatus =>
          // Check for HD insight
          val auth = response.header(HttpHeaders.WWW_AUTHENTICATE)
          val contentType = response.header(HttpHeaders.CONTENT_TYPE)
          if(contentType.isDefined &&  contentType.get == hdInsightErrorContentType && auth.isDefined && auth.get == hdInsightErrorWwwAuth) {
              AmbariForbiddenResponse(hdInsightErrorStatus,hdInsightErrorMessage,None)
          } else {
            throw AmbariError(new Exception(s"Received 401 from Ambari but response does not match any known cluster, tried HD insight"))
          }
        case _ => throw AmbariError(new Exception(s"Unexpected Response from Ambari, expected 403 or 401, actual ${response.status}"))

      }




  }

  import java.net.InetAddress
  private def getAmbariUrlWithIp(url: String): Try[URL] = {
    Try(new URL(url))
      .map { ambariUrl =>
        val hostAddressIp = InetAddress.getByName(ambariUrl.getHost)
        new URL(ambariUrl.getProtocol,
                hostAddressIp.getHostAddress,
                ambariUrl.getPort,
                ambariUrl.getFile)
      }
  }

  private def getAmbariUrl(url: String) = {
    getAmbariUrlWithIp(url) match {
      case Success(u) => Future.successful(u.toString)
      case Failure(f) => Future.failed(UrlError(f))
    }
  }

  val ambariConnectTimer = metricsRegistry.newTimer("ambari.status.request.time")

  val route =
    path("ambari" / "status") {
      val context = ambariConnectTimer.time()
      extractRequest { request =>
        post {
          entity(as[AmbariEndpoint]) { ep =>
            onComplete(checkAmbariAvailability(ep, request)) {
              case Success(res) =>
                context.stop()
                complete(success(res))
              case Failure(e) =>
                context.stop()
                e match {
                  case c: ConnectionError =>
                    complete(StatusCodes.InternalServerError,
                             errors(c, ErrorType.Network))
                  case c: UrlError =>
                    complete(StatusCodes.InternalServerError,
                             errors(c, ErrorType.Url))
                  case c: AmbariError =>
                    complete(StatusCodes.InternalServerError,
                             errors(c, ErrorType.Ambari))
                  case _ =>
                    complete(StatusCodes.InternalServerError, errors(e))
                }

            }
          }
        }
      }
    }

  import com.hortonworks.dataplane.commons.domain.Entities.DataplaneCluster
  import com.hortonworks.dataplane.commons.domain.JsonFormatters._

  val sync =
    path("cluster" / "sync") {
      extractRequest { request =>
        post {
          entity(as[DataplaneClusterIdentifier]) { dl =>
            val header = request.getHeader(Constants.DPTOKEN)
            val token =
              if (header.isPresent) Some(HJwtToken(header.get().value()))
              else None
            onComplete(dpClusterSync.triggerSync(dl.id, token)) { response =>
              complete(success(Map("status" -> 200)))
            }
          }
        }
      }
    }

  val health = path("health") {
    pathEndOrSingleSlash {
      get {
        complete(success(Map("status" -> 200)))
      }
    }
  }


  val metrics = path("metrics") {
    implicit val mr:MetricsRegistry = metricsRegistry
    pathEndOrSingleSlash {
      get {
        complete(MetricsReporter.asJson)
      }
    }
  }

}
