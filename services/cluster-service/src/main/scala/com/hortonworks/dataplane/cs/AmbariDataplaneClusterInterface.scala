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

package com.hortonworks.dataplane.cs

import com.hortonworks.dataplane.commons.domain.Entities.{DataplaneCluster, HJwtToken}
import com.hortonworks.dataplane.knox.Knox.{ApiCall, KnoxApiRequest, KnoxConfig}
import com.hortonworks.dataplane.knox.KnoxApiExecutor
import com.typesafe.config.Config
import com.typesafe.scalalogging.Logger
import play.api.libs.json.{JsObject, JsValue}
import play.api.libs.ws.{WSAuthScheme, WSClient, WSResponse}

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future
import scala.util.Try

sealed trait AmbariDataplaneClusterInterface {

  def discoverClusters(implicit hJwtToken: Option[HJwtToken]): Future[Seq[String]]

  def getHdpVersion(implicit hJwtToken: Option[HJwtToken]): Future[Seq[String]]

  def getClusterDetails(clusterName:String)(implicit hJwtToken: Option[HJwtToken]):Future[Option[JsValue]]

  def getServiceInfo(clusterName:String, serviceName:String)(implicit hJwtToken: Option[HJwtToken]):Future[Option[JsValue]]

  def getServiceVersion(stack:String, stackVersion: String, serviceName:String)(implicit hJwtToken: Option[HJwtToken]):Future[String]

  def getServices(clusterName:String)(implicit hJwtToken: Option[HJwtToken]): Future[Seq[String]]

}

class AmbariDataplaneClusterInterfaceImpl(dataplaneCluster: DataplaneCluster,
                                          val ws: WSClient,
                                          val config: Config,
                                          private val credentials: Credentials)
    extends AmbariDataplaneClusterInterface {

  val logger = Logger(classOf[AmbariDataplaneClusterInterfaceImpl])

  val prefix = Try(config.getString("dp.service.ambari.cluster.api.prefix"))
    .getOrElse("/api/v1/clusters")

  val stackApiPrefix = Try(config.getString("dp.service.ambari.stack.api.prefix"))
    .getOrElse("/api/v1/stacks")

  /** On a registered dpCluster, discover the clusters
    * and start data fetch jobs for them
    *
    * @return List of Cluster names
    */
  override def discoverClusters(implicit hJwtToken: Option[HJwtToken]): Future[Seq[String]] = {
    val url = s"${dataplaneCluster.ambariUrl}$prefix"
    val response = getAmbariResponse(url)

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

  override def getHdpVersion(implicit hJwtToken: Option[HJwtToken]): Future[Seq[String]] = {
    val url = s"${dataplaneCluster.ambariUrl}$prefix"
    val response = getAmbariResponse(url)

    response.map { res =>
      val items = (res.json \ "items" \\ "Clusters").map(_.as[JsObject].validate[Map[String, String]].map(m => Some(m)).getOrElse(None))
      val hdpVersion = items.map { item =>
        item.flatMap { map =>
          map.get("version")
        }
      }
      hdpVersion.collect { case Some(hdv) => hdv }
    }
  }

  def getAmbariResponse(requestUrl: String)(implicit hJwtToken: Option[HJwtToken]): Future[WSResponse] = {
    val request = ws.url(requestUrl)
    val requestWithLocalAuth = request.withAuth(credentials.user.get, credentials.pass.get, WSAuthScheme.BASIC)
    val delegatedCall:ApiCall = {req => req.get()}

    if(dataplaneCluster.knoxEnabled.isDefined && dataplaneCluster.knoxEnabled.get && dataplaneCluster.knoxUrl.isDefined && hJwtToken.isDefined){
      KnoxApiExecutor(KnoxConfig("token", dataplaneCluster.knoxUrl), ws).execute(
        KnoxApiRequest(request, delegatedCall, Some(hJwtToken.get.token)))
    } else requestWithLocalAuth.get()
  }

  override def getClusterDetails(clusterName:String)(implicit hJwtToken: Option[HJwtToken]):Future[Option[JsValue]] = {
    val url = s"${dataplaneCluster.ambariUrl}$prefix/$clusterName"
    val response = getAmbariResponse(url)

    response.map { res =>
      (res.json \ "Clusters").toOption
    }.recoverWith {
      case e: Exception =>
        logger.warn(s"Cannot get security details for cluster $clusterName",e)
        Future.successful(None)
    }
  }

  override def getServiceInfo(clusterName: String, serviceName: String)(implicit hJwtToken: Option[HJwtToken]): Future[Option[JsValue]] = {
    val url = s"${dataplaneCluster.ambariUrl}$prefix/$clusterName/services/$serviceName"
    val response = getAmbariResponse(url)

    response.map { res =>
      (res.json \ "ServiceInfo").toOption
    }.recoverWith {
      case e: Exception =>
        Future.successful(None)
    }
  }

  override def getServices(clusterName: String)(implicit hJwtToken: Option[HJwtToken]): Future[Seq[String]] = {
    val url = s"${dataplaneCluster.ambariUrl}$prefix/$clusterName/services"
    val response = getAmbariResponse(url)

    response.map { res =>
      val items = (res.json \ "items" \\ "ServiceInfo").map(_.as[JsObject].validate[Map[String, String]].map(m => Some(m)).getOrElse(None))
      val serviceOpts = items.map { item =>
        item.flatMap { map =>
          map.get("service_name")
        }
      }
      serviceOpts.collect { case Some(s) => s }
    }
  }

  override def getServiceVersion(stack: String, stackVersion: String, serviceName: String)(implicit hJwtToken: Option[HJwtToken]):Future[String]  = {
    val url = s"${dataplaneCluster.ambariUrl}$stackApiPrefix/$stack/versions/$stackVersion/services/$serviceName"
    val response = getAmbariResponse(url)

    response.map { res =>
      (res.json \ "StackServices" \ "service_version").validate[String].getOrElse("UNKNOWN")
    }
  }
}

object AmbariDataplaneClusterInterfaceImpl {
  def apply(dataplaneCluster: DataplaneCluster,
            ws: WSClient,
            config: Config, credentials: Credentials): AmbariDataplaneClusterInterfaceImpl =
    new AmbariDataplaneClusterInterfaceImpl(dataplaneCluster, ws, config,credentials)
}
