package com.hortonworks.dataplane.http

import com.hortonworks.dataplane.commons.domain.Entities.{Error, Errors}
import org.apache.commons.lang.exception.ExceptionUtils
import play.api.libs.json.Json
import play.api.libs.json.Json.JsValueWrapper



trait BaseRoute {


  import com.hortonworks.dataplane.commons.domain.JsonFormatters._

  def success(data: JsValueWrapper) = Json.obj("results" -> Json.obj("data" -> data))

  def errors(e: Throwable) = Json.toJson(Errors(Seq(Error(e.getMessage,ExceptionUtils.getStackTrace(e)))))

  def notFound = Json.obj("error" -> Json.obj("message" -> "Not found", "trace" -> ""))

  def badRequest = Json.obj("error" -> Json.obj("message" -> "BadRequest", "trace" -> ""))

}
