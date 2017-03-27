package controllers

import java.sql.SQLException

import com.hortonworks.dataplane.commons.domain.Entities.{Error, Errors}
import org.postgresql.util.PSQLException
import play.api.libs.json.Json
import play.api.libs.json.Json.JsValueWrapper
import play.api.mvc.{Controller, Result}

import scala.concurrent.Future

trait JsonAPI extends Controller {

  import com.hortonworks.dataplane.commons.domain.JsonFormatters._
  val pgErrors = Map("23503" -> Conflict, "23505" -> Conflict)

  def success(data: JsValueWrapper) = Ok(Json.obj("results" -> data))

  val notFound = NotFound(Json.toJson(wrapErrors("404","Not found")))

  def linkData(data: JsValueWrapper, links: Map[String, String]) =
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
    case e: Exception =>
      Future.successful(InternalServerError(Json.toJson(wrapErrors("500",e.getMessage))))
  }

  private def wrapErrors(code: String, message: String): Errors = {
    Errors(Seq(Error(code,message)))
  }

}
