package controllers

import javax.inject.Inject

import com.google.inject.name.Named
import com.hortonworks.dataplane.commons.domain.Entities.Cluster
import com.hortonworks.dataplane.commons.domain.JsonFormatters._
import com.hortonworks.dataplane.db.Webserice.ClusterService
import internal.auth.Authenticated
import models.JsonResponses
import play.api.Logger
import play.api.mvc._
import play.api.libs.json.Json

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future

class Clusters @Inject()(
    @Named("clusterService")
    val clusterService: ClusterService
) extends Controller {

  def list = Authenticated.async {
    clusterService.list()
      .map { clusters =>
        clusters match {
          case Left(errors) => InternalServerError(JsonResponses.statusError(s"Failed with ${Json.toJson(errors)}"))
          case Right(clusters) => Ok(Json.toJson(clusters))
        }
      }
  }


  def create = Authenticated.async(parse.json) { request =>
    Logger.info("Received create cluster request")
    request.body.validate[Cluster].map { cluster =>
      clusterService.create(cluster.copy(userid = request.user.id))
        .map {
          cluster => cluster match {
            case Left(errors) => InternalServerError(JsonResponses.statusError(s"Failed with ${Json.toJson(errors)}"))
            case Right(cluster) => Ok(Json.toJson(cluster))
          }
        }
    }.getOrElse(Future.successful(BadRequest))
  }

  def update = Authenticated.async(parse.json) { req =>
    Future.successful(Ok(JsonResponses.statusOk))
  }

  def get(id: String) = Authenticated.async {
    Future.successful(Ok(JsonResponses.statusOk))
  }

}
