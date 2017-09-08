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

package com.hortonworks.dataplane.restmock

import akka.actor.ActorRef
import akka.http.scaladsl.model.{HttpMethods, HttpRequest}
import akka.stream.Materializer


object httpmock {

  type RequestAssertion = HttpRequest => Boolean


  object when {

    def get(path:String)(implicit actor:ActorRef, materializer:Materializer):RequestBuilder = RequestBuilder({ req =>
      req.uri.path.toString == path && req.method == HttpMethods.GET
    })


    def post(path: String)(implicit actor:ActorRef, materializer:Materializer): RequestBuilder = RequestBuilder({ req =>
      req.uri.path.toString == path && req.method == HttpMethods.POST
    })

    def put(path: String)(implicit actor:ActorRef, materializer:Materializer): RequestBuilder = RequestBuilder({ req =>
      req.uri.path.toString == path && req.method == HttpMethods.PUT
    })

    def delete(path: String)(implicit actor:ActorRef, materializer:Materializer): RequestBuilder = RequestBuilder({ req =>
      req.uri.path.toString == path && req.method == HttpMethods.DELETE
    })


  }

}
