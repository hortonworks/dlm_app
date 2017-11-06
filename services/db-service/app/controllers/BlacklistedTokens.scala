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

import javax.inject._

import com.hortonworks.dataplane.commons.domain.JsonFormatters._
import com.hortonworks.dataplane.commons.domain.Entities.BlacklistedToken
import domain.BlacklistedTokenRepo
import play.api.libs.json.Json
import play.api.mvc.Action

import scala.concurrent.{ExecutionContext, Future}

@Singleton
class BlacklistedTokens @Inject()(blacklistedTokenRepo: BlacklistedTokenRepo)(implicit exec: ExecutionContext)
  extends JsonAPI {

  import com.hortonworks.dataplane.commons.domain.JsonFormatters._

  def findByToken(token: String) = Action.async {
    blacklistedTokenRepo.findByToken(token)
      .map(token => success(Json.toJson(token)))
      .recoverWith(apiError)
  }

  def insert = Action.async(parse.json) { req =>
    req.body
      .validate[BlacklistedToken]
      .map { token =>
        blacklistedTokenRepo
          .insert(token)
          .map(token => success(Json.toJson(token)))
          .recoverWith(apiError)
      }
      .getOrElse(Future.successful(BadRequest))
  }
}