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

import play.api.Logger
import com.hortonworks.dataplane.commons.domain.Entities.{Error, Errors, WrappedErrorException}
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
    case rae: WrappedErrorException => Status(rae.error.status)(Json.toJson(rae))
    case e: Exception =>
      InternalServerError(Json.toJson(Errors(Seq(Error(500, e.getMessage)))))
  }

}
