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
