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

import java.net.URL

import com.hortonworks.dataplane.commons.domain.Entities.ClusterHost
import com.hortonworks.dataplane.db.Webservice.ClusterHostsService
import com.hortonworks.dataplane.http.routes.{DpProfilerRoute, RangerRoute}
import com.typesafe.config.Config
import org.scalamock.scalatest.AsyncMockFactory
import org.scalatest._

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future

class ApiRewriteSpec extends AsyncFlatSpec with AsyncMockFactory {

  private val clusterDataApi: ClusterDataApi = mock[ClusterDataApi]
  private val cha = mock[ClusterHostsService]
  private val config: Config = mock[Config]

  "RangerRoute" should "construct a valid single node Ranger Url" in {
      val route = new RangerRoute(null,null,null,null,null,null,clusterDataApi,config,null)
    (config.getBoolean _).expects("dp.service.ambari.single.node.cluster").returning(true)
    (clusterDataApi.getAmbariUrl _).expects(1).returning(Future.successful("http://10.0.0.0:8080"))
    route.extractUrlsWithIp(new URL("http://abc.def:60040"),1).map { x =>
      assert(x.head == "http://10.0.0.0:60040")
    }

  }

  "RangerRoute" should "construct a valid Url when single node config is false" in {
    val route = new RangerRoute(null,cha,null,null,null,null,clusterDataApi,config,null)
    (config.getBoolean _).expects("dp.service.ambari.single.node.cluster").returning(false)
    (cha.getHostByClusterAndName _).expects(1,"abc.def").returning(Future.successful(Right(ClusterHost(ipaddr = "10.0.0.0",host="abc.def",status = "",clusterId = 1))))
    route.extractUrlsWithIp(new URL("http://abc.def:60040"),1).map { x =>
      assert(x.head == "http://10.0.0.0:60040")
    }
  }



  "DpProfilerRoute" should "construct a valid single node Ranger Url" in {
    val route = new DpProfilerRoute(null,cha,null,clusterDataApi,config,null)
    (config.getBoolean _).expects("dp.service.ambari.single.node.cluster").returning(true)
    (clusterDataApi.getAmbariUrl _).expects(1).returning(Future.successful("http://10.0.0.0:8080"))
    route.extractUrlsWithIp(new URL("http://abc.def:60040"),1).map { x =>
      assert(x.head == "http://10.0.0.0:60040")
    }

  }

  "DpProfilerRoute" should "construct a valid Url when single node config is false" in {
    val route = new DpProfilerRoute(null,cha,null,clusterDataApi,config,null)
    (config.getBoolean _).expects("dp.service.ambari.single.node.cluster").returning(false)
    (cha.getHostByClusterAndName _).expects(1,"abc.def").returning(Future.successful(Right(ClusterHost(ipaddr = "10.0.0.0",host="abc.def",status = "",clusterId = 1))))
    route.extractUrlsWithIp(new URL("http://abc.def:60040"),1).map { x =>
      assert(x.head == "http://10.0.0.0:60040")
    }
  }







}