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

package com.hortonworks.dataplane.http

import com.hortonworks.dataplane.commons.domain.Entities.{Error, Errors}
import org.apache.commons.lang3.exception.ExceptionUtils
import play.api.libs.json.Json
import play.api.libs.json.Json.JsValueWrapper

import scala.concurrent.Future

trait BaseRoute {

  import com.hortonworks.dataplane.commons.domain.JsonFormatters._

  def success(data: JsValueWrapper) = Json.obj("results" -> Json.obj("data" -> data))

  def errors(status: Int = 500,
             code: String = "cluster.generic",
             message: String,
             exception: Throwable) =
    Json.toJson(
      Errors(
        Seq(
          Error(status = status,
                code = code,
                message = message,
                trace = Some(ExceptionUtils.getStackTrace(exception))))))

  def notFound =
    Json.obj("error" -> Json.obj("message" -> "Not found", "trace" -> ""))

  def badRequest =
    Json.obj("error" -> Json.obj("message" -> "BadRequest", "trace" -> ""))

  def serverError =
    Json.obj("error" -> Json.obj("message" -> "ServerError", "trace" -> ""))

}
