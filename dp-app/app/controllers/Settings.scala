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

import java.io.File
import java.nio.file.Paths
import javax.inject.Inject

import com.google.inject.name.Named
import com.hortonworks.dataplane.commons.auth.AuthenticatedAction
import com.hortonworks.dataplane.commons.domain.Ambari.{AmbariEndpoint, ServiceInfo}
import com.hortonworks.dataplane.commons.domain.Entities._
import com.hortonworks.dataplane.commons.domain.JsonFormatters._
import com.hortonworks.dataplane.db.Webservice.{CertificateService, DpClusterService, SkuService}
import models.{JsonResponses, WrappedErrorsException}
import play.api.{Configuration, Logger}
import play.api.libs.json.{JsValue, Json}
import play.api.mvc._
import services.AmbariService

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future

class Settings @Inject()( @Named("certificateService") certificateService: CertificateService,
                          configuration: Configuration) extends Controller {

  def createCert = AuthenticatedAction.async(parse.json) { req =>
    req.body.validate[Certificate].map { certificate =>
      certificateService
        .create(certificate.copy(createdBy = req.user.id))
        .map { createdCert =>
         Ok(Json.toJson(createdCert))
        }.recoverWith {
          case e: Throwable =>
            Future.successful(
              InternalServerError(JsonResponses.statusError(e.getMessage)))
        }
    }.getOrElse(Future.successful(BadRequest))
  }

  def deleteCert(certificateId: String) = Action.async { req =>
      certificateService.delete(certificateId).map { response =>
        Ok(Json.toJson(response))
      }.recoverWith {
        case e: Throwable =>
          Future.successful(
            InternalServerError(JsonResponses.statusError(e.getMessage)))
      }
  }

  def listCerts = Action.async { request =>
    certificateService.list(Some(false)).map { certs =>
      Ok(Json.toJson(certs))
    }.recoverWith {
      case e: Throwable =>
        Future.successful(
          InternalServerError(JsonResponses.statusError(e.getMessage)))
    }
  }


}
