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

import com.hortonworks.dataplane.commons.domain.Entities.{Error, Errors, WrappedErrorException}
import domain.API.{AlreadyExistsError, EntityNotFound, UpdateError}
import org.postgresql.util.PSQLException
import play.api.Logger
import play.api.libs.json.Json
import play.api.libs.json.Json.JsValueWrapper
import play.api.mvc.{Controller, Result}

import scala.concurrent.Future

trait JsonAPI extends Controller {

  import com.hortonworks.dataplane.commons.domain.JsonFormatters._
  val pgErrors = Map("23503" -> CONFLICT,"23514" -> BAD_REQUEST,"23505" -> CONFLICT,"23502" -> BAD_REQUEST,"23000"-> BAD_REQUEST)

  def success(data: JsValueWrapper) = Ok(Json.obj("results" -> data))
  def entityCreated(data: JsValueWrapper) = Created(Json.obj("results" -> data))

  val notFound = NotFound(Json.toJson(wrapErrors(404,"Not found")))

  def linkData(data: JsValueWrapper, links: Map[String, String] = Map()) =
    Json.obj("data" -> data, "links" -> links)

  def apiErrorWithLog(logBlock : (Throwable) => Unit = defaultLogMessage): PartialFunction[Throwable, Future[Result]] = {
    case e: Throwable =>{
      logBlock(e)
      apiError.apply(e)
    }
  }

  private def defaultLogMessage =
    (e : Throwable) => Logger.error(e.getMessage, e)

  val apiError: PartialFunction[Throwable, Future[Result]] = {
    case e: PSQLException =>
      Future.successful {
        val status = pgErrors.get(e.getSQLState).getOrElse(500)
        val errors = wrapErrors(status, e.getMessage)
        Status(status)(Json.toJson(errors))
      }
    case e: WrappedErrorException => Future.successful(Status(e.error.status)(Json.toJson(e.error)))
    case e:EntityNotFound => Future.successful(notFound)
    case e:UpdateError => Future.successful(NoContent)
    case e: AlreadyExistsError => Future.successful(Conflict)
    case e: Exception =>
      Future.successful(InternalServerError(Json.toJson(wrapErrors(500,e.getMessage))))
  }

  private def wrapErrors(code: Int, message: String): Errors = {
    Errors(Seq(Error(code, message)))
  }


}
