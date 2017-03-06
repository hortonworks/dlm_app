package controllers

import java.sql.SQLException

import org.postgresql.util.PSQLException
import play.api.libs.json.Json
import play.api.libs.json.Json.JsValueWrapper
import play.api.mvc.{Controller, Result}

import scala.concurrent.Future

trait JsonAPI extends Controller {

  val pgErrors = Map("23503" -> Conflict,"23505" -> Conflict)

  def success(data: JsValueWrapper) = Ok(Json.obj("results" -> data))

  def linkData(data: JsValueWrapper, links: Map[String, String]) = Json.obj("data" -> data, "links" -> links)

  val apiError: PartialFunction[Throwable, Future[Result]] = {
    case e: PSQLException =>
      Future.successful {
        val resultOption = pgErrors.get(e.getSQLState)
        resultOption.map(r => r(Json.obj("code" -> e.getSQLState, "message" -> e.getMessage))).getOrElse {
          InternalServerError(Json.obj("error" -> e.getMessage))
        }
      }
    case e: Exception =>
      Future.successful(InternalServerError(Json.obj("error" -> e.getMessage)))
  }


}
