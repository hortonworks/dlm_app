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

package com.hortonworks.dataplane.cs.atlas

import java.net.URL

import com.hortonworks.dataplane.cs.ClusterDataApi
import com.typesafe.config.Config
import com.typesafe.scalalogging.Logger

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future
import scala.util.Try

sealed class AtlasApiSupplier(clusterId: Long,
                              config: Config,
                              clusterDataApi: ClusterDataApi) {
  private val log = Logger(classOf[AtlasApiSupplier])

  def get(): Future[Seq[String]] = {
    log.info("Loading Atlas urls")
    for {
      url <- clusterDataApi.getAtlasUrl(clusterId)
      dpCluster <- clusterDataApi.getDataplaneCluster(clusterId)
      array <- {
        val arr = url.map(_.toString).toArray
        val isSingleNodeCluster = Try(config.getBoolean("dp.service.ambari.single.node.cluster")).getOrElse(false)

        (isSingleNodeCluster, dpCluster.behindGateway) match {
          case (_, true) => clusterDataApi.getKnoxUrl(clusterId).map(url => Array(s"${url.get}/atlas"))
          case (true, false) => {
            clusterDataApi.getAmbariUrl(clusterId)
              .map { ambariUrl =>
                arr.map { h =>
                  val oldUrl = new URL(h)
                  new URL(oldUrl.getProtocol,
                    new URL(ambariUrl).getHost,
                    oldUrl.getPort,
                    oldUrl.getFile).toString
                }
              }
          }
          case (_, _) => Future.successful(arr)
        }
      }
    } yield (array)
  }
}
