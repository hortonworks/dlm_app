package com.hortonworks.dataplane.db

import com.hortonworks.dataplane.commons.domain.Entities.{
  ClusterService,
  ClusterServiceHost,
  Error,
  Errors
}
import com.hortonworks.dataplane.db.Webserice.ClusterComponentService
import com.typesafe.config.Config
import com.typesafe.scalalogging.Logger
import play.api.libs.json.Json
import play.api.libs.ws.{WSClient, WSResponse}

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future

class ClusterComponentServiceImpl(config: Config)(implicit ws: WSClient)
    extends ClusterComponentService {

  private val url = config.getString("dp.services.db.service.uri")
  import com.hortonworks.dataplane.commons.domain.JsonFormatters._
  val logger = Logger(classOf[ClusterComponentServiceImpl])

  override def create(clusterService: ClusterService)
    : Future[Either[Errors, ClusterService]] = {
    ws.url(s"$url/cluster/services")
      .withHeaders(
        "Content-Type" -> "application/json",
        "Accept" -> "application/json"
      )
      .post(Json.toJson(clusterService))
      .map(mapToService)
      .recoverWith {
        case e: Exception =>
          Future.successful(Left(Errors(Seq(Error("500", e.getMessage)))))
      }
  }

  private def mapToService(res: WSResponse) = {
    res.status match {
      case 200 =>
        extractEntity[ClusterService](
          res,
          r =>
            (r.json \ "results" \\ "data").head.validate[ClusterService].get)
      case _ => mapErrors(res)
    }
  }

  private def mapToHost(res: WSResponse) = {
    res.status match {
      case 200 =>
        extractEntity[ClusterServiceHost](
          res,
          r =>
            (r.json \ "results" \\ "data").head
              .validate[ClusterServiceHost]
              .get)
      case _ => mapErrors(res)
    }
  }

  private def maoToHosts(res: WSResponse) = {
    res.status match {
      case 200 =>
        extractEntity[Seq[ClusterServiceHost]](
          res,
          r =>
            (r.json \ "results" \\ "data").map {
              _.validate[ClusterServiceHost].get
          })
      case _ => mapErrors(res)
    }
  }

  override def getServiceByName(
      clusterId: Long,
      serviceName: String): Future[Either[Errors, ClusterService]] = {
    ws.url(s"$url/clusters/$clusterId/service/$serviceName")
      .withHeaders(
        "Content-Type" -> "application/json",
        "Accept" -> "application/json"
      )
      .get
      .map(mapToService)
      .recoverWith {
        case e: Exception =>
          Future.successful(Left(Errors(Seq(Error("500", e.getMessage)))))
      }
  }


  override def updateServiceByName(
      clusterData: ClusterService): Future[Either[Errors, Boolean]] = {
    ws.url(s"$url/clusters/services")
      .withHeaders(
        "Content-Type" -> "application/json",
        "Accept" -> "application/json"
      )
      .put(Json.toJson(clusterData))
      .map { res =>
        res.status match {
          case 200 => Right(true)
          case x =>
            Left(Errors(Seq(Error(x.toString, "Cannot update service"))))
        }
      }
      .recoverWith {
        case e: Exception =>
          Future.successful(Left(Errors(Seq(Error("500", e.getMessage)))))
      }
  }

  override def addClusterHosts(
      ClusterServiceHosts: Seq[ClusterServiceHost])
    : Future[Seq[Either[Errors, ClusterServiceHost]]] = {

    val requests = ClusterServiceHosts.map { cse =>
      ws.url(s"$url/services/endpoints")
        .withHeaders(
          "Content-Type" -> "application/json",
          "Accept" -> "application/json"
        )
        .post(Json.toJson(cse))
        .map(mapToHost)
        .recoverWith {
          case e: Exception =>
            logger.error(s"Cannot add cluster endpoint $cse", e)
            Future.successful(Left(Errors(Seq(Error("500", e.getMessage)))))
        }

    }

    Future.sequence(requests)
  }

  override def updateClusterHosts(
      ClusterServiceHosts: Seq[ClusterServiceHost])
    : Future[Seq[Either[Errors, Boolean]]] = {

    val requests = ClusterServiceHosts.map { cse =>
      ws.url(s"$url/services/endpoints")
        .withHeaders(
          "Content-Type" -> "application/json",
          "Accept" -> "application/json"
        )
        .put(Json.toJson(cse))
        .map(res =>
          res.status match {
            case 200 => Right(true)
            case x =>
              Left(
                Errors(
                  Seq(Error(x.toString, "Cannot update service endpoint"))))
        })
        .recoverWith {
          case e: Exception =>
            Future.successful(Left(Errors(Seq(Error("500", e.getMessage)))))
        }
    }
    Future.sequence(requests)
  }

  def resolve(result: Either[Errors, ClusterService],
              clusterId: Long,
              service: String) = Future.successful {
    if (result.isLeft) {
      throw new Exception(
        s"Could not load the service for cluster $clusterId and service $service ${result.left.get}")
    }
    result.right.get
  }

  override def getEndpointsForCluster(
      clusterId: Long,
      service: String): Future[Either[Errors, Seq[ClusterServiceHost]]] = {
    for {
      f1 <- getServiceByName(clusterId, service)
      f2 <- resolve(f1, clusterId, service)
      errorsOrEndpoints <- ws
        .url(s"$url/services/${f2.id.get}/endpoints")
        .withHeaders(
          "Content-Type" -> "application/json",
          "Accept" -> "application/json"
        )
        .get
        .map(maoToHosts)
    } yield errorsOrEndpoints

  }
}
