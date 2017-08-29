package com.hortonworks.dataplane.http

import com.hortonworks.dataplane.commons.domain.Entities.{Error, ErrorType, Errors}
import org.apache.commons.lang.exception.ExceptionUtils
import play.api.libs.json.Json
import play.api.libs.json.Json.JsValueWrapper

import scala.concurrent.Future



trait BaseRoute {


  import com.hortonworks.dataplane.commons.domain.JsonFormatters._

  def success(data: JsValueWrapper) = Json.obj("results" -> Json.obj("data" -> data))

  import com.hortonworks.dataplane.commons.domain.Entities.ErrorType._

  def errors(e: Throwable,errorType: ErrorType = ErrorType.General) = Json.toJson(e.asError(e.getMessage,errorType))

  def notFound = Json.obj("error" -> Json.obj("message" -> "Not found", "trace" -> ""))

  def badRequest = Json.obj("error" -> Json.obj("message" -> "BadRequest", "trace" -> ""))

}
