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

import java.sql.SQLException

import com.hortonworks.dataplane.commons.domain.Entities.{Error, Errors}
import domain.API.{EntityNotFound, UpdateError}
import org.postgresql.util.PSQLException
import play.api.libs.json.Json
import play.api.libs.json.Json.JsValueWrapper
import play.api.mvc.{Controller, Result}

import scala.concurrent.Future

trait JsonAPI extends Controller {

  import com.hortonworks.dataplane.commons.domain.JsonFormatters._
  val pgErrors = Map("23503" -> Conflict,"23514" -> BadRequest,"23505" -> Conflict,"23502" -> BadRequest,"23000"-> BadRequest)

  def success(data: JsValueWrapper) = Ok(Json.obj("results" -> data))
  def entityCreated(data: JsValueWrapper) = Created(Json.obj("results" -> data))

  val notFound = NotFound(Json.toJson(wrapErrors("404","Not found")))

  def linkData(data: JsValueWrapper, links: Map[String, String] = Map()) =
    Json.obj("data" -> data, "links" -> links)

  val apiError: PartialFunction[Throwable, Future[Result]] = {
    case e: PSQLException =>
      Future.successful {
        val resultOption = pgErrors.get(e.getSQLState)
        val errors = wrapErrors(e.getSQLState, e.getMessage)
        resultOption
          .map(r =>
            r(Json.toJson(errors)))
          .getOrElse {
            InternalServerError(Json.toJson(errors))
          }
      }
    case e:EntityNotFound => Future.successful(notFound)
    case e:UpdateError => Future.successful(NoContent)
    case e: Exception =>
      Future.successful(InternalServerError(Json.toJson(wrapErrors("500",e.getMessage))))
  }

  private def wrapErrors(code: String, message: String): Errors = {
    Errors(Seq(Error(code,message)))
  }


}
