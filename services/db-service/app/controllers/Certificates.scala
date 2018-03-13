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

import javax.inject._

import com.hortonworks.dataplane.commons.domain.Entities.{Certificate, Error, WrappedErrorException}
import domain.CertificateRepo
import play.api.libs.json.{JsError, JsSuccess}
import play.api.mvc._

import scala.concurrent.{ExecutionContext, Future}

@Singleton
class Certificates @Inject()(certificateRepo: CertificateRepo)(implicit exec: ExecutionContext)
  extends JsonAPI {

  import com.hortonworks.dataplane.commons.domain.JsonFormatters._

  def list(active: Option[Boolean]) = Action.async {
    certificateRepo.list(active)
      .map(success(_))
      .recoverWith(apiError)
  }

  def create() = Action.async(parse.json) { request =>
    (request.body.validate[Certificate] match {
      case certificate: JsSuccess[Certificate] => certificateRepo.create(certificate.get)
      case ex: JsError => Future.failed(WrappedErrorException(Error(400, "Malformed body", "database.http.malformed-body")))
    })
    .map(success(_))
    .recoverWith(apiError)
  }

  def retrieve(certificateId: String) = Action.async {
    certificateRepo.retrieve(certificateId)
      .map(success(_))
      .recoverWith(apiError)
  }

  def delete(certificateId: String) = Action.async {
    certificateRepo.delete(certificateId)
      .map(success(_))
      .recoverWith(apiError)
  }


}
