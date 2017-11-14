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

import com.hortonworks.dataplane.commons.domain.JsonFormatters._
import com.hortonworks.dataplane.commons.domain.Entities.{Error, Errors, LdapConfiguration, Role}
import com.hortonworks.dataplane.db.Webservice.LdapConfigService
import com.typesafe.config.Config
import play.api.libs.json.Json
import play.api.libs.ws.WSClient

import scala.concurrent.Future
import scala.concurrent.ExecutionContext.Implicits.global
@Singleton
class LdapConfigServiceImpl(config: Config)(implicit ws: WSClient)
    extends LdapConfigService {
  private def serviceUri = Option(System.getProperty("dp.services.db.service.uri"))
    .getOrElse(config.getString("dp.services.db.service.uri"))
  override def create(ldapConfig: LdapConfiguration)
    : Future[Either[Errors, LdapConfiguration]] = {
    ws.url(s"$serviceUri/ldapconfig")
      .withHeaders(
        "Content-Type" -> "application/json",
        "Accept" -> "application/json")
      .post(Json.toJson(ldapConfig))
      .map { res =>
        res.status match {
          case 200 => Right((res.json \ "results").validate[LdapConfiguration].get)
          case 404 => Left(Errors(Seq(Error("404", "API not found"))))
          case _ => mapErrors(res)
        }
      }
  }
  override def update(ldapConfig: LdapConfiguration): Future[Either[Errors, Boolean]] = {
    ws.url(s"$serviceUri/ldapconfig")
      .withHeaders(
        "Content-Type" -> "application/json",
        "Accept" -> "application/json")
      .put(Json.toJson(ldapConfig))
      .map { res =>
        res.status match {
          case 200 => Right(true)
          case 404 => Left(Errors(Seq(Error("404", "API not found"))))
          case _ => mapErrors(res)
        }
      }
  }
  override def get(): Future[Either[Errors, Seq[LdapConfiguration]]]={
    ws.url(s"$serviceUri/ldapconfig")
      .withHeaders(
        "Accept" -> "application/json")
      .get
      .map { res =>
        res.status match {
          case 200 => Right((res.json \ "results").validate[Seq[LdapConfiguration]].get)
          case 404 => Left(Errors(Seq(Error("404", "API not found"))))
          case _ => mapErrors(res)
        }
      }
  }
}
