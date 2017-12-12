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

import com.hortonworks.dataplane.http.routes.StatusRoute
import com.typesafe.config.Config
import org.scalamock.scalatest.AsyncMockFactory
import org.scalatest._

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future

class StatusRouteSpec extends AsyncFlatSpec with AsyncMockFactory {



  private val config: Config = mock[Config]

  "Route" should "correctly construct the knox URL" in {
    (config.getBoolean _).expects("dp.services.knox.infer.gateway.name").returning(true)
    val route = new StatusRoute(null,null,null,config,null,null,null)
    Future.successful(route.getKnoxUrl(new URL("http://blah:8443/test/a/b/c"))).map { o =>
      assert(o == "http://blah:8443/test")
    }

  }


  it should "correctly construct the default knox URL" in {
    (config.getBoolean _).expects("dp.services.knox.infer.gateway.name").returning(false)
    val route = new StatusRoute(null,null,null,config,null,null,null)
    Future.successful(route.getKnoxUrl(new URL("http://blah:8443/test/a/b/c"))).map { o =>
      assert(o == "http://blah:8443/gateway")
    }

  }






}