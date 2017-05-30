package com.hortonworks.dataplane.http.routes

import akka.http.scaladsl.model.StatusCodes
import akka.http.scaladsl.server.Directives.{as, entity, path, post, _}
import com.google.inject.Inject
import com.hortonworks.dataplane.cs.Errors.ClusterNotFound
import com.hortonworks.dataplane.cs.{
  AmbariDatalakeInterface,
  AmbariDatalakeInterfaceImpl,
  Credentials,
  StorageInterface
}
import com.hortonworks.dataplane.db.Webservice.ClusterService
import com.hortonworks.dataplane.http.BaseRoute
import com.typesafe.config.Config
import play.api.libs.json.JsValue
import play.api.libs.ws.{WSAuthScheme, WSClient}

import scala.concurrent.Future
import scala.util.{Failure, Success}
import scala.concurrent.ExecutionContext.Implicits.global

class AmbariRoute @Inject()(val ws: WSClient,
                            val storageInterface: StorageInterface,
                            val clusterService: ClusterService,
                            val config: Config)
    extends BaseRoute {

  import com.hortonworks.dataplane.commons.domain.Ambari._
  import com.hortonworks.dataplane.commons.domain.Entities._
  import com.hortonworks.dataplane.http.JsonSupport._

  private[dataplane] class TempDatalake(url: String)
      extends Datalake(id = None,
                       name = "",
                       description = "",
                       ambariUrl = url,
                       createdBy = None,
                       properties = None,
                       location = None)

  def mapToCluster(json: Option[JsValue],
                   cluster: String): Future[Option[AmbariCluster]] =
    Future.successful(
      json
        .map { j =>
          val secured =
            (j \ "security_type").validate[String].getOrElse("NONE")
          val map = (j \ "desired_service_config_versions")
            .validate[Map[String, JsValue]]
            .getOrElse(Map())
          Some(
            AmbariCluster(security = secured,
                          clusterName = cluster,
                          services = map.keys.toSeq))
        }
        .getOrElse(None))

  private def getDetails(
      clusters: Seq[String],
      dli: AmbariDatalakeInterface): Future[Seq[Option[AmbariCluster]]] = {
    val futures = clusters.map { c =>
      for {
        json <- dli.getClusterDetails(c)
        ambariCluster <- mapToCluster(json, c)
      } yield ambariCluster
    }
    Future.sequence(futures)
  }

  def getAmbariDetails(ep: AmbariEndpoint): Future[Seq[AmbariCluster]] = {

    val finalList = for {
      datalake <- Future.successful(new TempDatalake(url = ep.url))
      creds <- loadCredentials
      dli <- Future.successful(
        AmbariDatalakeInterfaceImpl(datalake, ws, config, creds))
      clusters <- dli.discoverClusters
      details <- getDetails(clusters, dli)
    } yield details
    finalList.map { item =>
      item.collect { case o if o.isDefined => o.get }
    }

  }

  private def loadCredentials = {
    val creds = for {
      user <- storageInterface.getConfiguration("dp.ambari.superuser")
      pass <- storageInterface.getConfiguration("dp.ambari.superuser.password")
    } yield {
      Credentials(user, pass)
    }
    creds
  }

  def getClusterData(clusterId: Long) = {
    val result = clusterService.retrieve(clusterId.toString)
    result.map { r =>
      if (r.isLeft)
        throw new ClusterNotFound()
      else
        r.right.get
    }
  }

  def callAmbariApi(credentials: Credentials, cluster: Cluster, req: String) = {
    ws.url(s"${cluster.ambariurl.get}/$req")
      .withAuth(credentials.user.get, credentials.pass.get, WSAuthScheme.BASIC)
      .get()
      .map(_.json)
  }

  private def issueAmbariCall(clusterId: Long, req: String) = {
    for {
      creds <- loadCredentials
      cluster <- getClusterData(clusterId)
      response <- callAmbariApi(creds, cluster, req)
    } yield response
  }

  val ambariProxy = path(LongNumber / "ambari") { clusterId =>
    pathEnd {
      parameters("request") { req =>
        val ambariResponse = issueAmbariCall(clusterId, req)
        onComplete(ambariResponse) {
          case Success(res) =>
            complete(res)
          case Failure(th) =>
            th.getClass match {
              case c if c == classOf[ClusterNotFound] =>
                complete(StatusCodes.NotFound, notFound)
              case _ =>
                complete(StatusCodes.InternalServerError, errors(th))
            }
        }
      }
    }
  }

  val route = path("ambari" / "details") {
    post {
      entity(as[AmbariEndpoint]) { ep =>
        val list = getAmbariDetails(ep)
        onComplete(list) {
          case Success(clusters) =>
            clusters.size match {
              case 0 =>
                complete(StatusCodes.NotFound, notFound)
              case _ => complete(success(clusters))
            }
          case Failure(th) =>
            complete(StatusCodes.InternalServerError, errors(th))
        }
      }
    }
  }

}
