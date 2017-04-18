package com.hortonworks.dataplane.http.routes

import javax.inject.{Inject, Singleton}

import akka.http.scaladsl.server.Directives._
import com.hortonworks.dataplane.db.Webserice.ClusterComponentService

@Singleton
class AtlasRoute @Inject()(private val clusterService: ClusterComponentService) {

  import com.hortonworks.dataplane.commons.domain.JsonFormatters._
  import com.hortonworks.dataplane.http.JsonSupport._

  val route =
    path("cluster" / IntNumber / "atlas") { id =>
      // use the cluster id to get atlas endpoint
      val service = clusterService.getServiceByName(id, "ATLAS")
      onSuccess(service) {
        case Right(errors) => complete(errors)
        case Left(data) => complete(data)
      }
    }

}

object AtlasRoute {
  def apply(clusterService: ClusterComponentService): AtlasRoute =
    new AtlasRoute(clusterService)
}
