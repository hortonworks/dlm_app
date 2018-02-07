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
import play.api.libs.json.Json
import play.api.mvc.{Controller, Result}

trait JsonAPI extends Controller {

  import com.hortonworks.dataplane.commons.domain.JsonFormatters._

  val apiError: PartialFunction[Throwable, Result] = {
    case rae: RestApiException => new Status(rae.respCode)(Json.toJson(rae))
    case e: Exception =>
      InternalServerError(Json.toJson(Errors(Seq(Error(500, e.getMessage)))))
  }

}
