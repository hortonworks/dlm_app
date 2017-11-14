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

package com.hortonworks.dataplane.db

import javax.inject.Singleton

import com.hortonworks.dataplane.commons.domain.Entities._
import com.hortonworks.dataplane.db.Webservice.LocationService
import com.typesafe.config.Config
import play.api.libs.ws.{WSClient, WSResponse}

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future

@Singleton
class LocationServiceImpl(config: Config)(implicit ws: WSClient)
    extends LocationService {

  private def url =
    Option(System.getProperty("dp.services.db.service.uri"))
      .getOrElse(config.getString("dp.services.db.service.uri"))

  import com.hortonworks.dataplane.commons.domain.JsonFormatters._

  override def list(query: Option[String]): Future[Either[Errors, Seq[Location]]] = {
    val uri = query match {case Some(query) => s"$url/locations?query=$query" case None => s"$url/locations"}
    ws.url(uri)
      .withHeaders("Accept" -> "application/json")
      .get()
      .map(mapToLocations)
  }

  override def retrieve(locationId: Long): Future[Either[Errors, Location]] = {
    ws.url(s"$url/locations/$locationId")
      .withHeaders("Accept" -> "application/json")
      .get()
      .map(mapToLocation)
  }

  private def mapToLocations(res: WSResponse) = {
    res.status match {
      case 200 =>
        extractEntity[Seq[Location]](res, r => (r.json \ "results").validate[Seq[Location]].get)
      case _ => mapErrors(res)
    }
  }

  private def mapToLocation(res: WSResponse) = {
    res.status match {
      case 200 =>
        extractEntity[Location](res, r => (r.json \ "results").validate[Location].get)
      case _ => mapErrors(res)
    }
  }
}
