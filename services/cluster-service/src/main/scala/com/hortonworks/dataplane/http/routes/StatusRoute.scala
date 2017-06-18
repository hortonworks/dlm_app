package com.hortonworks.dataplane.http.routes

import java.lang.Exception
import java.net.{URI, URL}
import javax.inject.Inject

import akka.http.scaladsl.model.{HttpRequest, StatusCodes}
import akka.http.scaladsl.server.Directives._
import com.hortonworks.dataplane.cs.{ClusterSync, StorageInterface}
import com.hortonworks.dataplane.http.BaseRoute
import com.hortonworks.dataplane.knox.Knox.{ApiCall, KnoxApiRequest, KnoxConfig}
import com.hortonworks.dataplane.knox.KnoxApiExecutor
import com.typesafe.config.Config
import com.typesafe.scalalogging.Logger
import play.api.libs.ws.{WSAuthScheme, WSClient, WSResponse}

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future
import scala.util.{Failure, Success, Try}

class StatusRoute @Inject()(val ws: WSClient,
                            storageInterface: StorageInterface,
                            val config: Config,
                            clusterSync: ClusterSync)
    extends BaseRoute {

  import com.hortonworks.dataplane.commons.domain.Ambari._
  import com.hortonworks.dataplane.http.JsonSupport._
  import scala.concurrent.duration._

  val logger = Logger(classOf[StatusRoute])

  def makeAmbariApiRequest(endpoint: String,
                           ambariResponse: AmbariForbiddenResponse,
                           timeout: Int,
                           request: HttpRequest) = {
    // Step 3
    // check if there was a jwtProviderUrl
    ambariResponse.jwtProviderUrl
      .map { providerUrl =>
        logger.info("Ambari expects a jwt token")
        //Extract the SSO URL hostname
        val uri = new URL(providerUrl)
        val knoxUrl = s"${uri.getProtocol}://${uri.getHost}:${uri.getPort}"
        logger.info(s"Knox detected at $knoxUrl")
        val delegatedRequest =
          ws.url(endpoint).withRequestTimeout(timeout seconds)
        val delegatedApiCall: ApiCall = { req =>
          req.get()
        }

        val tokenInfoHeader = request.getHeader("X-DP-Token-Info")
        if (!tokenInfoHeader.isPresent) {
          logger.error(
            "Knox was detected, but the called did not send a JWT token with the request header X-DP-Token-Info")
          throw new RuntimeException(
            "Ambari was Knox protected but no jwt token was sent with the request")
        }
        val tokenHeader = tokenInfoHeader.get.value
        val response =
          KnoxApiExecutor(KnoxConfig("token", knoxUrl), ws).execute(
            KnoxApiRequest(delegatedRequest, delegatedApiCall, tokenHeader))
        response.map { res =>
          res.status match {
            case 200 =>
              AmbariCheckResponse(ambariApiCheck = true,
                                  knoxDetected = true,
                                  res.status,
                                  Some(knoxUrl),
                                  res.json)
            case _ =>
              AmbariCheckResponse(ambariApiCheck = false,
                                  knoxDetected = true,
                                  res.status,
                                  Some(knoxUrl),
                                  res.json)
          }
        }
      }
      .getOrElse {
        // Fallback to local user
        // Step 4
        for {
          user <- storageInterface.getConfiguration("dp.ambari.superuser")
          pass <- storageInterface.getConfiguration(
            "dp.ambari.superuser.password")
          response <- ws
            .url(endpoint)
            .withAuth(user.get, pass.get, WSAuthScheme.BASIC)
            .withRequestTimeout(timeout seconds)
            .get()
        } yield {
          response.status match {
            case 200 =>
              AmbariCheckResponse(ambariApiCheck = true,
                                  knoxDetected = false,
                                  response.status,
                                  None,
                                  response.json)
            case _ =>
              AmbariCheckResponse(ambariApiCheck = false,
                                  knoxDetected = false,
                                  response.status,
                                  None,
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
    val endpoint: String = s"${ep.url}${Try(config.getString(
      "dp.service.ambari.cluster.api.prefix")).getOrElse("/api/v1/clusters")}"
    val timeout =
      Try(config.getInt("dp.service.ambari.status.check.timeout.secs"))
        .getOrElse(20)

    //Step 1
    val initialRequest = ws
      .url(endpoint)
      .withRequestTimeout(timeout seconds)
      .get()
      .map(mapAsUnauthenticatedResponse)

    for {
      ambariResponse <- initialRequest
      //Step 3
      ambariApiResponse <- makeAmbariApiRequest(endpoint,
                                                ambariResponse,
                                                timeout,
                                                request)
    } yield ambariApiResponse

  }

  private def mapAsUnauthenticatedResponse(
      response: WSResponse): AmbariForbiddenResponse = {
    if (response.status != 403)
      throw new RuntimeException(
        s"Attempt to access unauthenticated Ambari API's did not return the expected 403 response - $response")
    //Step 2
    response.json.validate[AmbariForbiddenResponse].get
  }

  val route =
    path("ambari" / "status") {
      extractRequest { request =>
        post {
          entity(as[AmbariEndpoint]) { ep =>
            onComplete(checkAmbariAvailability(ep, request)) {
              case Success(res) =>
                complete(success(res))
              case Failure(e) =>
                complete(StatusCodes.InternalServerError, errors(e))
            }
          }
        }
      }
    }

  import com.hortonworks.dataplane.commons.domain.Entities.DataplaneCluster
  import com.hortonworks.dataplane.commons.domain.JsonFormatters._

  val sync =
    path("cluster" / "sync") {
      post {
        entity(as[DataplaneCluster]) { dl =>
          if (dl.id.isEmpty)
            complete(StatusCodes.UnprocessableEntity)
          else {
            clusterSync.trigger(dl.id.get)
            complete(success(Map("status" -> 200)))
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

}
