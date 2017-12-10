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

import com.hortonworks.dataplane.cs.atlas.AtlasApiSupplier
import com.typesafe.config.Config
import org.scalamock.scalatest.AsyncMockFactory
import org.scalatest._

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future

class AtlasSupplierSpec extends AsyncFlatSpec with AsyncMockFactory {

  private val clusterDataApi: ClusterDataApi = mock[ClusterDataApi]
  private val config: Config = mock[Config]

  "Supplier" should "Construct valid single node Atlas Urls" in {
    val supplier = new AtlasApiSupplier(1, config, clusterDataApi)
    (config.getBoolean _).expects("dp.service.ambari.single.node.cluster").returning(true)
    (clusterDataApi.getAtlasUrl _).expects(1).returning(Future.successful(Set(new URL("http://abc.com:21000"))))
    (clusterDataApi.getCredentials _).expects().returning(Future.successful(Credentials(Some("admin"),Some("admin"))))
    (clusterDataApi.shouldUseToken _).expects(1).returning(Future.successful(false))
    (clusterDataApi.getAmbariUrl _).expects(1).returning(Future.successful("http://10.0.0.0:8080"))
    supplier.get().map { x =>
      assert(!x.shouldUseToken)
    }

  }


   it should "Construct valid multi node Atlas Urls" in {
    val supplier = new AtlasApiSupplier(1, config, clusterDataApi)
    (config.getBoolean _).expects("dp.service.ambari.single.node.cluster").returning(false)
    (clusterDataApi.getAtlasUrl _).expects(1).returning(Future.successful(Set(new URL("http://abc.com:21000"))))
    (clusterDataApi.getCredentials _).expects().returning(Future.successful(Credentials(Some("admin"),Some("admin"))))
    (clusterDataApi.shouldUseToken _).expects(1).returning(Future.successful(false))
    supplier.get().map { x =>
      assert(!x.shouldUseToken)
    }


  }




}