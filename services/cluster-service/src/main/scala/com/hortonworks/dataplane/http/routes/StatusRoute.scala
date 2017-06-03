package com.hortonworks.dataplane.http.routes

import java.lang.Exception
import javax.inject.Inject

import akka.http.scaladsl.model.StatusCodes
import akka.http.scaladsl.server.Directives._

import com.hortonworks.dataplane.cs.{ClusterSync, StorageInterface}
import com.hortonworks.dataplane.http.BaseRoute
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

  def checkAmbariAvailability(ep: AmbariEndpoint): Future[WSResponse] = {
    val endpoint: String = s"${ep.url}${Try(config.getString(
      "dp.service.ambari.cluster.api.prefix")).getOrElse("/api/v1/clusters")}"
    val timeout =
      Try(config.getInt("dp.service.ambari.status.check.timeout.secs"))
        .getOrElse(20)
    for {
      user <- storageInterface.getConfiguration("dp.ambari.superuser")
      pass <- storageInterface.getConfiguration("dp.ambari.superuser.password")
      response <- ws
        .url(endpoint)
        .withAuth(user.get, pass.get, WSAuthScheme.BASIC)
        .withRequestTimeout(timeout seconds)
        .get()
    } yield {
      response
    }
  }

  val route =
    path("ambari" / "status") {
      post {
        entity(as[AmbariEndpoint]) { ep =>
          onComplete(checkAmbariAvailability(ep)) {
            case Success(res) => complete(success(Map("status" -> res.status)))
            case Failure(e) =>
              complete(StatusCodes.InternalServerError, errors(e))
          }
        }
      }
    }

  import com.hortonworks.dataplane.commons.domain.Entities.DataplaneCluster
  import com.hortonworks.dataplane.commons.domain.JsonFormatters._

  val sync =
    path("datalake" / "sync") {
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
    pathEndOrSingleSlash{
      get{
        complete(success(Map("status" -> 200)))
      }
    }
  }




}
