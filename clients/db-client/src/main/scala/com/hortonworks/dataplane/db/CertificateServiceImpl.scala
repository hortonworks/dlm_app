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

import com.hortonworks.dataplane.commons.domain.Entities._
import com.hortonworks.dataplane.commons.domain.JsonFormatters._
import com.hortonworks.dataplane.db.Webservice.{CertificateService, SkuService}
import com.typesafe.config.Config
import play.api.libs.json.Json
import play.api.libs.ws.{WSClient, WSResponse}

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future

class CertificateServiceImpl(config: Config)(implicit ws: WSClient)
    extends CertificateService {
  private def url =
    Option(System.getProperty("dp.services.db.service.uri"))
      .getOrElse(config.getString("dp.services.db.service.uri"))

  override def list(active: Option[Boolean]): Future[Seq[Certificate]] = {
    ws.url(s"$url/certificates")
      .withHeaders("Accept" -> "application/json")
      .get()
      .map { res =>
        res.status match {
          case 200 => (res.json \ "results").validate[Seq[Certificate]].get
          case _ => throw WrappedErrorException(Error(res.status, "", "core.api-error"))
        }
      }
  }

  override def create(certificate: Certificate): Future[Certificate] = {
    ws.url(s"$url/certificate")
      .withHeaders(
        "Accept" -> "application/json",
        "Content-Type" -> "application/json"
      )
      .post(Json.toJson(certificate))
      .map { res =>
        res.status match {
          case 200 => (res.json \ "results").validate[Certificate].get
          case _ => throw WrappedErrorException(Error(res.status, "", "core.api-error"))
        }
      }
  }

  override def delete(certificateId: String): Future[Long] = {
    ws.url(s"$url/certificate/$certificateId")
      .withHeaders("Accept" -> "application/json")
      .delete()
      .map { res =>
        res.status match {
          case 200 => (res.json \ "results").validate[Long].get
          case _ => throw WrappedErrorException(Error(res.status, "", "core.api-error"))
        }
      }
  }
}
