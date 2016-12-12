package controllers

import com.hw.dp.service.cluster.DataConstraints
import internal.auth.Authenticated
import play.api.libs.json.Json
import play.api.mvc._

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future

/**
  * Get settings to show in various parts of the APP
  */
class Settings extends Controller {


  def getDataCenterTypes = Authenticated.async { req =>
    val dcTypes = DataConstraints.dcTypes
    Future.successful(Ok(Json.toJson(dcTypes)))
  }





}
