/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
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
    */
  trait CloudAccountDetails {
    def provider: String;
    def getAccountId(): String;
  }
  @SerialVersionUID(1234)
  case class CloudAccountWithCredentials(var id: Option[String] = None, accountCredentials: CloudAccountCredentials, accountDetails: CloudAccountDetails) extends Serializable {
    /**
      * Generate and set `id`. It's used to generate id before serialization and storing to credential store
      */
    def presetId: Unit = {
      id = Option(s"${id.getOrElse(accountDetails.getAccountId())}_${accountDetails.provider}_${accountCredentials.credentialType}")
    }
  }
  case class CloudAccountsItem(id: String, accountDetails: CloudAccountDetails)
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
        case S3_TOKEN  => Json.fromJson[S3AccountCredential](data)(s3CloudAccountCredentialFmt)
        case WASB_TOKEN  => Json.fromJson[WASBAccountCredential](data)(Json.format[WASBAccountCredential])
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
        case CloudAccountProvider.S3  => Json.fromJson[S3AccountDetails](data)(s3AccountDetailsFmt)
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
  implicit val genericErrorWrites = Json.writes[GenericError]

  implicit val keyStoreWriteErrorReads = Json.reads[KeyStoreWriteError]
  implicit val keyStoreWriteErrorWrites = Json.writes[KeyStoreWriteError]
}

