package com.hortonworks.dataplane.cs

import com.hortonworks.dataplane.commons.domain.Entities.DataplaneCluster
import com.typesafe.config.Config
import com.typesafe.scalalogging.Logger
import play.api.libs.json.{JsObject, JsValue}
import play.api.libs.ws.{WSAuthScheme, WSClient}
import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future
import scala.util.Try

sealed trait AmbariDatalakeInterface {

  def discoverClusters: Future[Seq[String]]

  def getClusterDetails(clusterName:String):Future[Option[JsValue]]

}

class AmbariDatalakeInterfaceImpl(datalake: DataplaneCluster,
                                  val ws: WSClient,
                                  val config: Config,
                                  private val credentials: Credentials)
    extends AmbariDatalakeInterface {

  val logger = Logger(classOf[AmbariDatalakeInterfaceImpl])

  val prefix = Try(config.getString("dp.service.ambari.cluster.api.prefix"))
    .getOrElse("/api/v1/clusters")

  /** On a registered datalake, discover the clusters
    * and start data fetch jobs for them
    *
    * @return List of Cluster names
    */
  override def discoverClusters: Future[Seq[String]] = {
    val response = ws.url(s"${datalake.ambariUrl}$prefix")
      .withAuth(credentials.user.get, credentials.pass.get, WSAuthScheme.BASIC)
      .get()
    response.map { res =>
      val items = (res.json \ "items" \\ "Clusters").map(_.as[JsObject].validate[Map[String, String]].map(m => Some(m)).getOrElse(None))
      // each item is a Some(cluster)
      // start defining the cluster mapping
      val clusterOpts = items.map { item =>
        item.flatMap { map =>
          map.get("cluster_name")
        }
      }
      clusterOpts.collect { case Some(c) => c }
    }
  }



  override def getClusterDetails(clusterName:String):Future[Option[JsValue]] = {
    val response = ws.url(s"${datalake.ambariUrl}$prefix/$clusterName")
      .withAuth(credentials.user.get, credentials.pass.get, WSAuthScheme.BASIC)
      .get()
    response.map { res =>
      (res.json \ "Clusters").toOption
    }.recoverWith {
      case e: Exception =>
        logger.warn(s"Cannot get security details for cluster $clusterName",e)
        Future.successful(None)
    }
  }
}

object AmbariDatalakeInterfaceImpl {
  def apply(datalake: DataplaneCluster,
            ws: WSClient,
            config: Config, credentials: Credentials): AmbariDatalakeInterfaceImpl =
    new AmbariDatalakeInterfaceImpl(datalake, ws, config,credentials)
}
