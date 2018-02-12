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

package controllers

import com.hortonworks.dataplane.commons.domain.Entities.{Error, Errors, RestApiException}
import play.api.Logger
import play.api.libs.json.Json
import play.api.mvc.{Controller, Result}

trait JsonAPI extends Controller {

  import com.hortonworks.dataplane.commons.domain.JsonFormatters._

  def apiErrorWithLog(logBlock : (Throwable) => Unit = defaultLogMessage): PartialFunction[Throwable, Result] = {
    case e: Throwable =>{
      logBlock(e)
      apiError.apply(e)
    }
  }

  private def defaultLogMessage =
    (e : Throwable) => Logger.error(e.getMessage, e)


  val apiError: PartialFunction[Throwable, Result] = {
    case rae: RestApiException => new Status(rae.respCode)(Json.toJson(rae))
    case e: Exception =>
      InternalServerError(Json.toJson(wrapErrors("500",e.getMessage)))
  }

  private def wrapErrors(code: String, message: String): Errors = {
    Errors(Seq(Error(code,message)))
  }


}
