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

import com.hortonworks.dataplane.commons.domain.Entities.{
  EnabledSku,
  Sku
}
import com.hortonworks.dataplane.db.Webservice.SkuService
import com.typesafe.config.Config
import play.api.libs.json.Json
import play.api.libs.ws.{WSClient, WSResponse}
import scala.concurrent.Future
import com.hortonworks.dataplane.commons.domain.JsonFormatters._
import scala.concurrent.ExecutionContext.Implicits.global

class SkuServiceImpl(config: Config)(implicit ws: WSClient)
    extends SkuService {
  private def url =
    Option(System.getProperty("dp.services.db.service.uri"))
      .getOrElse(config.getString("dp.services.db.service.uri"))

  override def getAllSkus(): Future[Either[Error, Seq[Sku]]] = {
    ws.url(s"$url/skus")
      .withHeaders("Accept" -> "application/json")
      .get()
      .map { res =>
        mapToSkus(res)
      }
  }
  override def getSku(name: String): Future[Either[Error, Sku]] = {
    ws.url(s"$url/skus/byName/$name")
      .withHeaders("Accept" -> "application/json")
      .get()
      .map { res =>
        mapToSku(res)
      }
  }

  def getEnabledSkus(): Future[Either[Error, Seq[EnabledSku]]] = {
    ws.url(s"$url/enabledskus")
      .withHeaders("Accept" -> "application/json")
      .get()
      .map { res =>
        mapToEnabledSkus(res)
      }
  }

  def enableSku(enabledSku: EnabledSku): Future[Either[Error, EnabledSku]] = {
    ws.url(s"$url/enabledskus")
      .withHeaders("Accept" -> "application/json")
      .post(Json.toJson(enabledSku))
      .map { res =>
        mapToEnabledSku(res)
      }
  }

  private def mapToSkus(res: WSResponse) = {
    res.status match {
      case 200 => Right((res.json \ "results").validate[Seq[Sku]].get)
      case _ => mapError(res)
    }
  }
  private def mapToEnabledSkus(res: WSResponse) = {
    res.status match {
      case 200 => Right((res.json \ "results").validate[Seq[EnabledSku]].get)
      case _ => mapError(res)
    }
  }
  private def mapToSku(res: WSResponse) = {
    res.status match {
      case 200 => Right((res.json \ "results").validate[Sku].get)
      case _ => mapError(res)
    }
  }

  private def mapToEnabledSku(res: WSResponse) = {
    res.status match {
      case 200 => Right((res.json \ "results").validate[EnabledSku].get)
      case _ => mapError(res)
    }
  }

}
