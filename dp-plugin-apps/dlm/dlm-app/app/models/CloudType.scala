/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

package models

import models.CloudAccountProvider.CloudAccountProvider
import models.CloudCredentialType.CloudCredentialType
import play.api.libs.json._

/**
  * Cloud types that are supported for cloud replication
  */
sealed trait CloudType {
  def name: String
}

case object S3 extends CloudType { val name = "S3" }

case object ADLS extends CloudType { val name = "ADLS" }

case object WASB extends CloudType { val name = "WASB" }

/**
  * Cloud credential types that are supported for cloud replication
  */
object CloudCredentialType extends Enumeration {
  type CloudCredentialType = Value

  val WASB_TOKEN = Value("WASB_TOKEN")
  val WASB_SAS_TOKEN = Value("WASB_SAS_TOKEN")
  val S3_TOKEN = Value("S3_TOKEN")
  val ADLS_STS = Value("ADLS_STS")

  implicit val cloudCredentialTypeFormat = new Format[CloudCredentialType] {
    def reads(json: JsValue) = JsSuccess(CloudCredentialType.withName(json.as[String]))
    def writes(myEnum: CloudCredentialType) = JsString(myEnum.toString)
  }
}

/**
  * List of supported cloud providers
  */
object CloudAccountProvider extends Enumeration {
  type CloudAccountProvider = Value

  val WASB = Value("WASB")
  val S3 = Value("S3")
  val ADLS = Value("ADLS")

  implicit val cloudAccountProviderFormat = new Format[CloudAccountProvider] {
    def reads(json: JsValue) = JsSuccess(CloudAccountProvider.withName(json.as[String]))
    def writes(myEnum: CloudAccountProvider) = JsString(myEnum.toString)
  }
}
