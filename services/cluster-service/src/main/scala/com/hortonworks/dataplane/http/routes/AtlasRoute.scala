package com.hortonworks.dataplane.http.routes

import java.util.concurrent.TimeUnit
import javax.inject.{Inject, Singleton}

import akka.http.scaladsl.model.StatusCodes
import akka.http.scaladsl.server.Directives._
import com.google.common.base.{Supplier, Suppliers}
import com.hortonworks.dataplane.db.Webserice.ClusterComponentService
import com.hortonworks.dataplane.http.BaseRoute

import scala.concurrent.ExecutionContext.Implicits.global
import com.typesafe.config.Config
import com.typesafe.scalalogging.Logger
import org.apache.atlas.AtlasClientV2

import scala.concurrent.Future
import scala.util.{Failure, Success, Try}

@Singleton
class AtlasRoute @Inject()(private val clusterService: ClusterComponentService,
                           private val config: Config) extends BaseRoute{

  import com.hortonworks.dataplane.commons.domain.JsonFormatters._
  import com.hortonworks.dataplane.http.JsonSupport._

  val logger = Logger(classOf[AtlasRoute])
  val supplierCache = collection.mutable.Map[Long, Supplier[Future[String]]]()
  val atlasClientCache = collection.mutable.Map[Long,Supplier[AtlasClientV2]]()

  // Atlas endpoints don't change too often

  lazy val atlasEndpointCacheTime =
    Try(config.getInt("dp.services.cluster.http.atlas.endpoint.cache.secs"))
      .getOrElse(30)

  val route =
    path("cluster" / LongNumber / "atlas") {id =>
      get
      {
        val supplier = supplierCache.getOrElseUpdate(
          id,
          Suppliers.memoizeWithExpiration(
            new AtlasEndpointSupplier(clusterService, id),
            atlasEndpointCacheTime,
            TimeUnit.SECONDS))

        onComplete(supplier.get()) {
          case Success(url) => complete(success(url))
          case Failure(e) => complete(StatusCodes.InternalServerError, errors(e))
        }

      }
    }
}

private[http] class AtlasEndpointSupplier(
    clusterComponentService: ClusterComponentService,
    clusterId: Long)
    extends Supplier[Future[String]] {
  override def get(): Future[String] = {
    clusterComponentService.getServiceByName(clusterId, "ATLAS").map {
      case Right(service) => service.fullURL.get
      case Left(errors) =>
        throw new Exception(s"Cannot load cluster data $errors")
    }
  }
}

object AtlasRoute {
  def apply(clusterService: ClusterComponentService): AtlasRoute =
    new AtlasRoute(clusterService, null)
}
