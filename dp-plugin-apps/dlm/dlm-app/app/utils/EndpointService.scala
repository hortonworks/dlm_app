package utils

import java.net.URL

import com.google.inject.{Inject, Singleton}
import com.google.inject.name.Named
import com.hortonworks.dataplane.commons.domain.Ambari.{ClusterServiceWithConfigs, ConfigurationInfo}
import com.hortonworks.dataplane.commons.domain.Entities.{Error, Errors}
import com.hortonworks.dataplane.cs.Webservice.AmbariWebService
import com.hortonworks.dataplane.db.Webservice.{ClusterService, DpClusterService}
import com.hortonworks.dlm.beacon.domain.RequestEntities.RangerServiceDetails
import play.api.Logger

import scala.concurrent.Future
import scala.concurrent.ExecutionContext.Implicits.global


/**
  * Utility componenent which transforms FQDN's present if service configuration objects to
  * the Ambari hostname provided by the DP on-boarding step
  *
  * This is a workaround for cloud based deployments where there is a single node available
  * and addresable only by the external IP address
  * @param ambariService
  * @param cs
  * @param dpc
  */
@Singleton
class EndpointService @Inject()(
                                 @Named("ambariService")
                                 val ambariService: AmbariWebService,
                                 @Named("clusterService") cs: ClusterService,
                                 @Named("dpClusterService") dpc: DpClusterService) {

  private def singleNode: Future[Boolean] = ambariService.isSingleNode

  private def getHost(clusterId: Long): Future[String] =
    for {
      clusterLookup <- cs.retrieve(clusterId.toString)
      c <- Future.successful(clusterLookup.right.get.dataplaneClusterId)
      dpc <- dpc.retrieve(c.get.toString)
      host <- Future.successful(new URL(dpc.right.get.ambariUrl).getHost)
    } yield host

  /**
    * Change the quorum to the single node cluster if applicable
    * else return input
    *
    * @param q
    */
  def transformZKQuorum(q: String, clusterId: Long):Future[String] = {
    singleNode.flatMap {
      case true =>
        getHost(clusterId).map { host =>
          val hosts = q.split(",").map { v =>
            val s = v.split(":")
            (s(0), s(1))
          }
          hosts.map(h => s"$host:${h._2}").mkString(",")
        }
      case false => Future.successful(q)
    }.recoverWith {
      case e:Throwable =>
        Logger.warn("Cannot transform Zk Quorum",e)
        Future.successful(q)
    }
  }


  private def transform(k: String, v: Option[String], h: String): Option[String] = {

    val fsr = "(hdfs://|webhdfs://)(.*)(:\\d+)".r
    val hpr = "(.*)(:\\d+)".r
    v.map { d =>
      if (k == "fsEndpoint") {
        Some(fsr.replaceAllIn(d, s"$$1$h$$3"))
      } else if (k.startsWith("dfs.namenode.rpc-address")) {
        Some(hpr.replaceAllIn(d, s"$h$$2"))
      } else Some(d)
    }
      .getOrElse(None)
  }

  /**
    * Change Hdfs Data and any Host related Data to a single node scheme or return original map
    *
    * @param data
    * @param clusterId
    * @return
    */
  def transFormHdfsData(data: Map[String, Option[String]],
                        clusterId: Long): Future[Map[String, Option[String]]] = {
    singleNode.flatMap {
      case true =>
        var map = collection.mutable.Map[String, Option[String]]()
        getHost(clusterId).map { h =>
          data.foreach {
            case (k, v) =>
              map.put(k, transform(k, v, h))
          }
          map.toMap
        }

      case false => Future.successful(data)
    }.recoverWith {
      case e:Throwable =>
        Logger.warn("Cannot transform Hdfs data",e)
        Future.successful(data)
    }
  }


  def transformRangerData(rsd:RangerServiceDetails,clusterId:Long) = {
    singleNode.flatMap {
      case false => Future.successful(rsd)
      case true =>
        getHost(clusterId).map{ h =>
          val originalUrl = new URL(rsd.rangerEndPoint)
          val newUrl = new URL(originalUrl.getProtocol,h,originalUrl.getPort,originalUrl.getFile)
          rsd.copy(rangerEndPoint = newUrl.toString)
        }
    }.recoverWith {
      case e:Throwable =>
        Logger.warn("Cannot transform Ranger data",e)
        Future.successful(rsd)
    }
  }



  /**
    * Get beacon server endpoint
    *
    * @param endpointData service host and properties details
    * @return
    */
  def getBeaconEndpoint(endpointData: ClusterServiceWithConfigs)
  : Future[Either[Errors, String]] = {
    val beaconSchemePortMap =
      Map("http" -> "beacon_port", "https" -> "beacon_tls_enabled")
    val beaconScheme: String =
      getPropertyValue(endpointData, "beacon-env", "beacon_tls_enabled") match {
        case Right(bs) => if (bs == "true") "https" else "http"
        case Left(_) => "http"
      }

    val beaconPort = getPropertyValue(endpointData,
      "beacon-env",
      beaconSchemePortMap(beaconScheme))

    beaconPort match {
      case Right(bp) =>
        singleNode.flatMap {
          case true =>
            getHost(endpointData.clusterid.get).map { h =>
              val beaconEndpoint = s"$beaconScheme://$h:$bp"
              Right(beaconEndpoint)
            }
          case false =>
            val beaconHostName = endpointData.servicehost
            val beaconEndpoint = s"$beaconScheme://$beaconHostName:$bp"
            Future.successful(Right(beaconEndpoint))
        }
      case Left(errors) => Future.successful(Left(errors))
    }

  }

  /**
    *
    * @param endpointData configuration blob
    * @param configType   config type
    * @param configName   config property name
    * @return
    */
  def getPropertyValue(endpointData: ClusterServiceWithConfigs,
                       configType: String,
                       configName: String): Either[Errors, String] = {
    val serviceName = endpointData.servicename
    val configProperties: Option[ConfigurationInfo] =
      endpointData.configProperties
    configProperties match {
      case Some(configTypes) =>
        val configProperties =
          configTypes.properties.find(_.`type` == configType)
        configProperties match {
          case Some(cp) =>
            cp.properties.get(configName) match {
              case Some(configValue) => Right(configValue)
              case None =>
                val errorMsg =
                  s"$configName is not found in $configType for $serviceName"
                Logger.error(errorMsg)
                Left(Errors(Seq(Error("500", errorMsg))))
            }
          case None =>
            val errorMsg = s"$configType is not associated with $serviceName"
            Logger.error(errorMsg)
            Left(Errors(Seq(Error("500", errorMsg))))
        }
      case None =>
        val errorMsg = s"configuration blob is not available for $serviceName"
        Logger.error(errorMsg)
        Left(Errors(Seq(Error("500", errorMsg))))
    }
  }

}
