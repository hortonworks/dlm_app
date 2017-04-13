package controllers.actions

import javax.inject.Inject

import com.google.inject.name.Named
import com.hortonworks.dataplane.commons.domain.Entities.{Cluster, Datalake}
import com.hortonworks.dataplane.commons.domain.JsonFormatters._
import com.hortonworks.dataplane.db.Webserice.{ClusterService, LakeService}
import internal.auth.Authenticated
import models.{JsonResponses, WrappedErrorsException}
import models.JsonFormatters._
import models.RequestSyntax.RegisterLake
import play.api.Logger
import play.api.libs.json.Json
import play.api.mvc.Controller

import scala.concurrent.Future
import scala.concurrent.ExecutionContext.Implicits.global


class LakeActions @Inject()(
    @Named("lakeService") val lakeService: LakeService,
    @Named("clusterService") val clusterService: ClusterService
  ) extends Controller {

//  def addWithCluster =  Authenticated.async(parse.json) { request =>
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

  def listWithClusters = Authenticated.async {
    Logger.info("list lakes with clusters")

    retrieveLakes()
      .flatMap({ lakes =>
        val lakeFutures =
          lakes.map({ cLake =>
            for {
              lake <- Future.successful(cLake)
              clusters <- retrieveClusters(cLake.id.get)
            } yield Json.obj(
              "data" -> lake,
              "clusters" -> clusters
            )
          })
        Future.sequence(lakeFutures)
      })
      .map({lakes => Ok(Json.toJson(lakes))})
      .recover {
        case WrappedErrorsException(ex) => InternalServerError(JsonResponses.statusError(s"Failed with ${Json.toJson(ex.errors)}"))
      }
  }

  private def retrieveLakes(): Future[Seq[Datalake]] = {
    lakeService.list()
        .flatMap({ lakes =>
          lakes match {
            case Left(errors) => Future.failed(WrappedErrorsException(errors))
            case Right(lakes) => Future.successful(lakes)
          }
        })
  }

  private def retrieveClusters(lakeId: Long): Future[Seq[Cluster]] = {
    clusterService.getLinkedClusters(lakeId)
        .flatMap({ clusters =>
          clusters match {
            case Left(errors) => Future.failed(WrappedErrorsException(errors))
            case Right(clusters) => Future.successful(clusters)
          }
        })
  }

}
