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

package controllers.actions

import javax.inject.Inject

import com.google.inject.name.Named
import com.hortonworks.dataplane.commons.domain.Entities.{Cluster, DataplaneCluster}
import com.hortonworks.dataplane.commons.domain.JsonFormatters._
import com.hortonworks.dataplane.db.Webservice.{ClusterService, DpClusterService}
import models.{JsonResponses, WrappedErrorsException}
import play.api.Logger
import play.api.libs.json.Json
import play.api.mvc.{Action, Controller}

import scala.concurrent.Future
import scala.concurrent.ExecutionContext.Implicits.global

class DpClusterActions @Inject()(
    @Named("dpClusterService") val dpClusterService: DpClusterService,
    @Named("clusterService") val clusterService: ClusterService) extends Controller {

  def listWithClusters() = Action.async {
    Logger.info("list lakes with clusters")

    retrieveLakes()
      .flatMap({ lakes =>
        val lakeFutures =
          lakes
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
          InternalServerError(Json.toJson(ex.errors))
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
