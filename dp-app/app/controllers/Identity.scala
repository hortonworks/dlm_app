package controllers

import com.hortonworks.dataplane.commons.domain.JsonFormatters._
import internal.auth.Authenticated
import play.api.libs.json.Json
import play.api.mvc._
import scala.concurrent.Future

class Identity ()
  extends Controller {

  def retrieve = Authenticated.async { request =>
    Future.successful(Ok(Json.toJson(request.user)))
  }
}
