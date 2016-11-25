package com.hw.dp.services.weather


import java.util.Date

import akka.actor.ActorRef
import akka.stream.ActorMaterializer
import com.hw.dp.service.api._
import play.api.libs.ws.ahc.AhcWSClient
import play.api.libs.ws.{WSRequest, WSResponse}

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future
import scala.concurrent.duration._

class WeatherService(service: Service,persister:Option[ActorRef]) extends ServiceActor(service: Service,persister:Option[ActorRef]){

  val api = "http://api.openweathermap.org/data/2.5/forecast/city?id=524901&APPID=353830ed8343c03171cce6ea7acdc51f"

  implicit val system = context.system
  implicit val materializer = ActorMaterializer()
  val client: WSRequest = AhcWSClient().url(api)

  override def fetchData(service: Service,callback:Option[Snapshot] => Unit) = {

    val response: Future[WSResponse] = client.withHeaders("Accept" -> "application/json")
        .withRequestTimeout(10000.millis)
        .withQueryString("id"->"524901","APPID"->"353830ed8343c03171cce6ea7acdc51f")
          .get()

    response.map{ r =>
      callback(Some(Snapshot("1",new Date().getTime,SnapshotData(Some(r.json.toString())),"weather")))
    }

  }

  override def stopRunning: Unit = ???

}
