/*
 * HORTONWORKS DATAPLANE SERVICE AND ITS CONSTITUENT SERVICES
 *
 * (c) 2016-2018 Hortonworks, Inc. All rights reserved.
 *
 * This code is provided to you pursuant to your written agreement with Hortonworks, which may be the terms
 * of the Affero General Public License version 3 (AGPLv3), or pursuant to a written agreement with a third party
 * authorized to distribute this code.  If you do not have a written agreement with Hortonworks or with
 * an authorized and properly licensed third party, you do not have any rights to this code.
 *
 * If this code is provided to you under the terms of the AGPLv3: A) HORTONWORKS PROVIDES THIS CODE TO YOU
 * WITHOUT WARRANTIES OF ANY KIND; (B) HORTONWORKS DISCLAIMS ANY AND ALL EXPRESS AND IMPLIED WARRANTIES WITH
 * RESPECT TO THIS CODE, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF TITLE, NON-INFRINGEMENT, MERCHANTABILITY
 * AND FITNESS FOR A PARTICULAR PURPOSE; (C) HORTONWORKS IS NOT LIABLE TO YOU, AND WILL NOT DEFEND, INDEMNIFY,
 * OR HOLD YOU HARMLESS FOR ANY CLAIMS ARISING FROM OR RELATED TO THE CODE; AND (D) WITH RESPECT
 * TO YOUR EXERCISE OF ANY RIGHTS GRANTED TO YOU FOR THE CODE, HORTONWORKS IS NOT LIABLE FOR ANY DIRECT,
 * INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, PUNITIVE OR CONSEQUENTIAL DAMAGES INCLUDING, BUT NOT LIMITED TO,
 * DAMAGES RELATED TO LOST REVENUE, LOST PROFITS, LOSS OF INCOME, LOSS OF BUSINESS ADVANTAGE OR UNAVAILABILITY,
 * OR LOSS OR CORRUPTION OF DATA.
 */

package models

import java.io.Serializable

import models.ADLSEntities.{ADLSAccountCredentials, ADLSAccountDetails}
import models.CloudAccountEntities.Error._
import models.AmazonS3Entities.{S3AccountCredential, S3AccountDetails}
import models.CloudCredentialType._
import models.CloudAccountProvider._
import models.WASBEntities.{WASBAccountCredential, WASBAccountCredentialSAS, WASBAccountDetails}
import play.api.libs.json._

object CloudAccountEntities {
  sealed trait Error
  object Error {
    final case class GenericError(message: String) extends Error
    final case class DeserializationError(message: String) extends Error
    final case class CredentialNotFoundInKeystoreError(message: String) extends Error
    final case class CloudCredentialNameExists(message: String) extends Error
    final case class KeyStoreWriteError(message: String) extends Error
  }

  /**
    * Base trait for account credentials
    */
  trait CloudAccountCredentials {
    def credentialType: String
  }

  /**
    * Base trait for account details which contains user's info such as user name, account id etc.
    * This information is exposed via DLM REST GET API
    */
  trait CloudAccountDetails {
    def provider: String
    def credentialType: Option[CloudCredentialType]
    def accountName: Option[String]
  }
  @SerialVersionUID(1234)
  case class CloudAccountWithCredentials(id: String, version: Option[Long], accountCredentials: CloudAccountCredentials, accountDetails: CloudAccountDetails) extends Serializable
  case class CloudAccountsItem(id: String, version: Long, accountDetails: CloudAccountDetails)
  case class CloudAccountsBody(accounts: List[CloudAccountsItem])

  implicit val cloudCredentialTypeReads = Reads.enumNameReads(CloudCredentialType)
  implicit val cloudAccountProviderReads = Reads.enumNameReads(CloudAccountProvider)

  implicit val s3CloudAccountCredentialFmt = Json.format[S3AccountCredential]
  implicit val wasbAccountCredentialFmt = Json.format[WASBAccountCredential]
  implicit val wasbAccountCredentialSasFmt = Json.format[WASBAccountCredentialSAS]
  implicit val adlsAccountCredentialsFmt = Json.format[ADLSAccountCredentials]

  implicit val cloudAccountCredentialsFmt: Format[CloudAccountCredentials] = new Format[CloudAccountCredentials] {
    def reads(json: JsValue): JsResult[CloudAccountCredentials] = {
      def from(name: CloudCredentialType, data: JsObject): JsResult[CloudAccountCredentials] = name match {
        case AWS_ACCESSKEY  => Json.fromJson[S3AccountCredential](data)(s3CloudAccountCredentialFmt)
        case AWS_INSTANCEPROFILE => Json.fromJson[S3AccountCredential](data)(s3CloudAccountCredentialFmt)
        case WASB_ACCESSKEY  => Json.fromJson[WASBAccountCredential](data)(Json.format[WASBAccountCredential])
        case WASB_SAS_TOKEN => Json.fromJson[WASBAccountCredentialSAS](data)(Json.format[WASBAccountCredentialSAS])
        case ADLS_STS => Json.fromJson[ADLSAccountCredentials](data)(Json.format[ADLSAccountCredentials])
        case _      => JsError(s"Unknown credentialType '$name'")
      }

      for {
        name <- (json \ "credentialType").validate[CloudCredentialType]
        data <- (json).validate[JsObject]
        result <- from(name, data)
      } yield result
    }

    def writes(cloudAccountCredentials: CloudAccountCredentials): JsValue = {
      cloudAccountCredentials match {
        case data: S3AccountCredential => Json.toJson(data)(s3CloudAccountCredentialFmt)
        case data: WASBAccountCredential => Json.toJson(data)(wasbAccountCredentialFmt)
        case data: WASBAccountCredentialSAS => Json.toJson(data)(wasbAccountCredentialSasFmt)
        case data: ADLSAccountCredentials => Json.toJson(data)(adlsAccountCredentialsFmt)
      }
    }
  }

  implicit val s3AccountDetailsFmt = Json.format[S3AccountDetails]
  implicit val wasbAccountDetailsFmt = Json.format[WASBAccountDetails]
  implicit val adlsAccountDetailsFmt = Json.format[ADLSAccountDetails]

  implicit val cloudAccountDetailsFmt: Format[CloudAccountDetails] = new Format[CloudAccountDetails] {
    def reads(json: JsValue): JsResult[CloudAccountDetails] = {
      def from(name: CloudAccountProvider, data: JsObject): JsResult[CloudAccountDetails] = name match {
        case CloudAccountProvider.AWS  => Json.fromJson[S3AccountDetails](data)(s3AccountDetailsFmt)
        case CloudAccountProvider.WASB => Json.fromJson[WASBAccountDetails](data)(wasbAccountDetailsFmt)
        case CloudAccountProvider.ADLS => Json.fromJson[ADLSAccountDetails](data)(adlsAccountDetailsFmt)
        case _      => JsError(s"Unknown provider '$name'")
      }

      for {
        name <- (json \ "provider").validate[CloudAccountProvider]
        data <- (json).validate[JsObject]
        result <- from(name, data)
      } yield result
    }

    def writes(cloudAccountDetails: CloudAccountDetails): JsValue = {
      cloudAccountDetails match {
        case data: S3AccountDetails => Json.toJson(data)(s3AccountDetailsFmt)
        case data: WASBAccountDetails => Json.toJson(data)(wasbAccountDetailsFmt)
        case data: ADLSAccountDetails => Json.toJson(data)(adlsAccountDetailsFmt)
      }
    }
  }

  implicit val cloudAccountBodyFmt = Json.format[CloudAccountWithCredentials]
  implicit val cloudAccountsItemFmt = Json.format[CloudAccountsItem]
  implicit val clouadAccountsBodyFmt = Json.format[CloudAccountsBody]

  implicit val deserializationErrorReads = Json.reads[DeserializationError]
  implicit val deserializationErrorWrites = Json.writes[DeserializationError]

  implicit val credentialNotFoundInKeystoreErrorReads = Json.reads[CredentialNotFoundInKeystoreError]
  implicit val credentialNotFoundInKeystoreErrorWrites = Json.writes[CredentialNotFoundInKeystoreError]

  implicit val cloudCredentialNameExistsReads = Json.reads[CloudCredentialNameExists]
  implicit val cloudCredentialNameExistsWrites = Json.writes[CloudCredentialNameExists]

  implicit val genericErrorReads = Json.reads[GenericError]
  implicit val genericErrorWrites = new Writes[GenericError] {
    override def writes(o: GenericError): JsValue = {
      Json.obj(
        "error" -> Json.obj("message" -> o.message)
      )
    }
  }

  implicit val keyStoreWriteErrorReads = Json.reads[KeyStoreWriteError]
  implicit val keyStoreWriteErrorWrites = new Writes[KeyStoreWriteError] {
    override def writes(o: KeyStoreWriteError): JsValue = {
      Json.obj(
        "error" -> Json.obj("message" -> o.message)
      )
    }
  }
}

