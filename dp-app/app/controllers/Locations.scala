package controllers

import javax.inject.Inject

import com.google.inject.name.Named
import com.hortonworks.dataplane.commons.domain.JsonFormatters._
import com.hortonworks.dataplane.db.Webserice.LocationService
import internal.auth.Authenticated
import models.JsonResponses
import play.api.libs.json.Json
import play.api.mvc._

import scala.concurrent.ExecutionContext.Implicits.global

class Locations @Inject()(@Named("locationService") val locationService: LocationService,authenticated:Authenticated)
  extends Controller {

  def list(query: Option[String]) = authenticated.async {
    locationService.list(query)
      .map { locations =>
        locations match {
          case Left(errors) => InternalServerError(JsonResponses.statusError(s"Failed with ${Json.toJson(errors)}"))
          case Right(locations) => Ok(Json.toJson(locations))
        }
      }
  }

  def retrieve(locationId: Long) = authenticated.async {
    locationService.retrieve(locationId)
      .map { location =>
        location match {
          case Left(errors) => InternalServerError(JsonResponses.statusError(s"Failed with ${Json.toJson(errors)}"))
          case Right(location) => Ok(Json.toJson(location))
        }
      }
  }
}
