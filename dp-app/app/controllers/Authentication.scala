package controllers


import javax.inject.Inject

import internal.Jwt
import models.{Credential, JsonResponses}
import models.JsonFormats._
import org.mindrot.jbcrypt.BCrypt
import play.api.libs.json.{JsSuccess, Json}
import play.api.Configuration
import play.api.mvc._
import play.api.libs.ws.WSClient
import scala.concurrent.Future
import scala.concurrent.ExecutionContext.Implicits.global


class Authentication @Inject() (val ws: WSClient, val config: Configuration)
  extends Controller {

  def signIn = Action.async(parse.json) { request =>

    request.body.validate[Credential].map { credential =>
      val username = credential.id;
      val password = credential.password;
      val roles = new Array[String](1);
      roles(0) = "SUPERADMIN";

      ws
        .url(config.getString("datasource.service.uri").get + "/user/" + username)
        .withHeaders("Accept" -> "application/json")
        .get()
        .map {
          response =>
            if(response.status != 200) {
              Unauthorized(JsonResponses.statusError(s"Cannot find user for request"))
            }

            import com.hortonworks.dataplane.commons.domain.Entities._
            import com.hortonworks.dataplane.commons.domain.JsonFormatters._

            (response.json \ "results").get.validate[User] match {
              case JsSuccess(user, _)  if BCrypt.checkpw(password, user.password) => Ok(
                Json.obj(
                  "id" -> user.username,
                  "avatar" -> user.avatar,
                  "display" -> user.displayname,
                  "token" -> Jwt.makeJWT(user),
                  "roles" -> roles
                )
              )
              case _ => Unauthorized(JsonResponses.statusError(s"Cannot find user for request"))
            }
        }
    }.getOrElse(Future.successful(BadRequest(JsonResponses.statusError("Cannot parse user request"))))
  }

}



