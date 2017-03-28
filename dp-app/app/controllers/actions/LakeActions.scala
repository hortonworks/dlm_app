package controllers.actions

import javax.inject.Inject

import com.google.inject.name.Named
import com.hortonworks.dataplane.commons.domain.Entities.Cluster
import com.hortonworks.dataplane.db.Webserice.{ClusterService, LakeService}
import internal.auth.Authenticated
import models.JsonResponses
import models.RequestSyntax.RegisterLake
import play.api.Logger
import play.api.libs.json.Json
import play.api.mvc.Controller

import scala.concurrent.Future


class LakeActions @Inject()(
    @Named("lakeService") val lakeService: LakeService,
    @Named("clusterService") val clusterService: ClusterService
  ) extends Controller {

//  def register =  Authenticated.async(parse.json) { request =>
//    Logger.info("Received create lake and cluster request")
//    request.body.validate[RegisterLake].map { request: RegisterLake =>
//      val lake = request.lake;
//      lakeService.create(lake)
//      clusterService.create(cluster.copy(userid = request.user.id))
//        .map {
//          cluster => cluster match {
//            case Left(errors) => InternalServerError(JsonResponses.statusError(s"Failed with ${Json.toJson(errors)}"))
//            case Right(cluster) => Ok(Json.toJson(cluster))
//          }
//        }
//    }.getOrElse(Future.successful(BadRequest))
//  }

}
