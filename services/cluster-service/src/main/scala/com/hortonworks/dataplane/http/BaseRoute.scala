package com.hortonworks.dataplane.http

import org.apache.commons.lang.exception.ExceptionUtils
import play.api.libs.json.Json
import play.api.libs.json.Json.JsValueWrapper


trait BaseRoute {


  def success(data: JsValueWrapper) = Json.obj("results" -> Json.obj("data" -> data))

  def errors(e: Throwable) = Json.obj("result" -> Json.obj("error" -> e.getMessage, "trace" -> ExceptionUtils.getStackTrace(e)))

}
