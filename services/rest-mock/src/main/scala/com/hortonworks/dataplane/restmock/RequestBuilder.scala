package com.hortonworks.dataplane.restmock

import akka.actor.ActorRef
import akka.http.scaladsl.model.HttpHeader.ParsingResult
import akka.http.scaladsl.model.Uri.Query
import akka.http.scaladsl.model._
import akka.stream.Materializer
import com.hortonworks.dataplane.restmock.httpmock.RequestAssertion

import scala.collection.mutable.ListBuffer
import scala.concurrent.Await
import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.duration._

case class Return(builder: RequestBuilder,
                  response: HttpResponse => HttpResponse)

case class Clear()

case class RequestBuilder(pathVerifier: RequestAssertion)(
    implicit materializer: Materializer) {

  private val verifiers = ListBuffer[RequestAssertion](pathVerifier)

  def withParams(params: (String, String)*): RequestBuilder = {
    verifiers += { req =>
      req.uri.query() == Query(params: _*)
    }
    this
  }

  def withBody(body: String) = {
    verifiers += { req =>
      val eventualString = req.entity.toStrict(5 seconds).map(_.data.decodeString("UTF-8"))
      val eventualBoolean = eventualString.map(s => s == body)
      val result = Await.result(eventualBoolean,5.seconds)
      result
    }
    this
  }

  def withHeaders(headerList: (String, String)*) = {
    verifiers += { req =>
      val headers = headerList
        .map { h =>
          val pr = HttpHeader.parse(h._1, h._2)
          val ok = pr.asInstanceOf[ParsingResult.Ok]
          ok.header
        }

      headers.toSet.subsetOf(req.headers.toSet)
    }
    this
  }

  def getContentType(contentType: Option[(String, String)]): String = {
    contentType.map(c => c._2).getOrElse("application/json")
  }

  def thenRespond(statusCode: Int,
                  responseBody: String,
                  headers: (String, String)*)(implicit actor: ActorRef): Unit =
    actor ! Return(
      this, { r =>
        // Check if content type was defined
        val contentType: Option[(String, String)] =
          headers.find(p => p._1.toLowerCase.trim == "content-type")
        r.copy(
          StatusCode.int2StatusCode(Option(statusCode).getOrElse(200)),
          headers
            .map { h =>
              val pr = HttpHeader.parse(h._1, h._2)
              val ok = pr.asInstanceOf[ParsingResult.Ok]
              ok.header
            }
            .to[collection.immutable.Seq],
          HttpEntity(ContentType(MediaTypes.`application/json`),Option(responseBody).getOrElse(""))
        )
      }
    )

  def verify(req: HttpRequest): Boolean =
    verifiers.toList.map(_(req)).foldRight(true)((k, v) => k && v)

}
