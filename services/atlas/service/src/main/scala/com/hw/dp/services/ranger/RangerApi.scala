package com.hw.dp.services.ranger

import play.api.libs.json.JsValue

import scala.concurrent.Future

case class Ranger(solrEndpoint:String)

trait RangerApi {

  def initialize:Future[Ranger]

  def getTopUsers:Future[JsValue]

  def getRangerAuditLogs:Future[JsValue]

  def getTopAccessTypes:Future[JsValue]

}
