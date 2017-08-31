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

import javax.inject.Inject

import com.google.inject.name.Named
import com.hortonworks.dataplane.commons.domain.JsonFormatters._
import com.hortonworks.dataplane.db.Webservice.LocationService
import com.hortonworks.dataplane.commons.auth.Authenticated
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
