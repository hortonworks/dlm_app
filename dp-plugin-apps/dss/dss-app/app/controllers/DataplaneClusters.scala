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
import com.hortonworks.dataplane.db.Webservice.{DpClusterService}
import play.api.libs.json.Json
import play.api.mvc._
import play.api.{Configuration}

import scala.concurrent.ExecutionContext.Implicits.global

class DataplaneClusters @Inject()(
    @Named("dpClusterService") val dpClusterService: DpClusterService,
    configuration: Configuration)
    extends Controller {

  def list = Action.async {
    dpClusterService
      .list()
      .map {
        case Left(errors) =>
          InternalServerError(Json.toJson(errors))
        case Right(dataplaneClusters) => Ok(Json.toJson(dataplaneClusters))
      }
  }

}
