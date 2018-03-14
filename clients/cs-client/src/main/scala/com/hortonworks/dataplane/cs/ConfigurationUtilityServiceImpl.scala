
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

package com.hortonworks.dataplane.cs

import com.hortonworks.dataplane.commons.domain.Entities.{Error, HJwtToken, WrappedErrorException}
import com.hortonworks.dataplane.cs.Webservice.ConfigurationUtilityService
import com.typesafe.config.Config
import play.api.libs.json.JsValue

import scala.concurrent.Future


class ConfigurationUtilityServiceImpl(val config: Config)(implicit ws: ClusterWsClient) extends ConfigurationUtilityService {
  override def doReloadCertificates(): Future[JsValue] = {
    ws.url(s"$url/configuration/actions/reloadCertificates")
      .withToken(None)
      .withHeaders("Accept" -> "application/json")
      .get()
      .map { res =>
        res.status match {
          case 200 => res.json
          case _ => throw WrappedErrorException(Error(status = 500, message = "Unable to reload certificates", code = "cluster.configuration.cert-reload-failed"))
        }
      }
  }
}





