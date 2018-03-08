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
package services

import com.hortonworks.dataplane.commons.domain.Entities.ServiceHealth
import com.typesafe.config.Config
import play.api.libs.json.{JsObject, JsResult}
import play.api.libs.ws.WSClient

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future

trait HealthService {
  def getServiceHealth(serviceId: String) : Future[Either[JsObject, ServiceHealth]]
}

class ConsulHealthService (config: Config)(implicit ws: WSClient) extends HealthService {

  private def consulHost = Option(config.getString("consul.host")).getOrElse("localhost")

  private def consulPort = Option(config.getString("consul.port")).getOrElse("8500")

  private val healthUrl = s"http://$consulHost:$consulPort/v1/health/checks"

  def getServiceHealth(serviceId: String): Future[Either[JsObject, ServiceHealth]] = {
    ws.url(s"$healthUrl/$serviceId").get()
      .map(res => {
        res.status match {
          case 200 => {
           val opt = res.json.as[List[JsObject]].headOption
            opt match {
              case None => Right(ServiceHealth(Some(false), Some(false)))
              case Some(response) => {
                val status: JsResult[String] = (response \ "Status").validate[String]
                if (status.isSuccess && status.get.toLowerCase == "passing") {
                  Right(ServiceHealth(Some(true), Some(true)))
                } else {
                  Right(ServiceHealth(Some(true), Some(false)))
                }
              }
            }
          }
          case _ => Left(res.json.as[JsObject])
        }
      })
  }
}

