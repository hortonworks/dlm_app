package controllers.actions

import javax.inject.Inject

import com.google.inject.name.Named
import com.hortonworks.dataplane.commons.domain.Entities.{
  Cluster,
  DataplaneCluster
}
import com.hortonworks.dataplane.commons.domain.JsonFormatters._
import com.hortonworks.dataplane.db.Webservice.{
  ClusterService,
  DpClusterService
}
import internal.auth.Authenticated
import models.{JsonResponses, WrappedErrorsException}
import models.JsonFormatters._
import models.RequestSyntax.RegisterDpCluster
import play.api.Logger
import play.api.libs.json.Json
import play.api.mvc.Controller

import scala.concurrent.Future
import scala.concurrent.ExecutionContext.Implicits.global

class DpClusterActions @Inject()(
    @Named("dpClusterService") val dpClusterService: DpClusterService,
    @Named("clusterService") val clusterService: ClusterService,
    authenticated: Authenticated
) extends Controller {

  def listWithClusters(validOnly: Option[Boolean]) = authenticated.async {
    Logger.info("list lakes with clusters")

    val validOnlyFlag = validOnly.getOrElse(false);

    retrieveLakes()
      .flatMap({ lakes =>
        val lakeFutures =
          lakes
            .filter{cLake =>
              if(validOnlyFlag) {
                cLake.isDatalake.getOrElse(false)   // only valid lakes
              }  else {
                true  // return all results if flag is not sent
              }}
            .map({ cLake =>
              for {
                lake <- Future.successful(cLake)
                clusters <- retrieveClusters(cLake.id.get)
              } yield
                Json.obj(
                  "data" -> lake,
                  "clusters" -> clusters
                )
            })
        Future.sequence(lakeFutures)
      })
      .map({ lakes =>
        Ok(Json.toJson(lakes))
      })
      .recover {
        case WrappedErrorsException(ex) =>
          InternalServerError(
            JsonResponses.statusError(
              s"Failed with ${Json.toJson(ex.errors)}"))
      }
  }

  private def retrieveLakes(): Future[Seq[DataplaneCluster]] = {
    dpClusterService
      .list()
      .flatMap({
        case Left(errors) => Future.failed(WrappedErrorsException(errors))
        case Right(lakes) => Future.successful(lakes)
      })
  }

  private def retrieveClusters(lakeId: Long): Future[Seq[Cluster]] = {
    clusterService
      .getLinkedClusters(lakeId)
      .flatMap({
        case Left(errors) => Future.failed(WrappedErrorsException(errors))
        case Right(clusters) => Future.successful(clusters)
      })
  }

}
