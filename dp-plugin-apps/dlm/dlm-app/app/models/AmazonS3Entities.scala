

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

import models.AmazonS3Entities.Error._
import play.api.libs.json.{JsValue, Json}

object AmazonS3Entities {
  sealed trait Error
  object Error {
    final case class GenericError(message: String) extends Error
    final case class DeserializationError(message: String) extends Error
    final case class CredentialNotFoundInKeystoreError(message: String) extends Error
    final case class CloudCredentialNameExists(message: String) extends Error
    final case class KeyStoreWriteError(message: String) extends Error
    final case class AmazonS3Error(message: String) extends Error
  }
  @SerialVersionUID(123)
  case class Credential (accessKeyId: String, secretAccessKey: String) extends Serializable
  @SerialVersionUID(125)
  case class CloudAccountWithCredential (cloudAccount: CloudAccount, credential: Credential) extends Serializable
  @SerialVersionUID(124)
  case class CloudAccount (accountId: Long, userName: String) extends Serializable
  case class CloudAccounts (accounts: List[CloudAccount])

  case class CloudUserDetails(accountId: String, accountOwnerName: String, userName: String)
  case class Bucket (name: String, owner: String, creationDate: String)


  implicit val credentialReads = Json.reads[Credential]
  implicit val credentialWrites = Json.writes[Credential]

  implicit val cloudAccountReads = Json.reads[CloudAccount]
  implicit val cloudAccountWrites = Json.writes[CloudAccount]

  implicit val cloudAccountWithCredentialReads = Json.reads[CloudAccountWithCredential]
  implicit val cloudAccountWithCredentialWrites = Json.writes[CloudAccountWithCredential]

  implicit val cloudAccountsReads = Json.reads[CloudAccounts]
  implicit val cloudAccountsWrites = Json.writes[CloudAccounts]

  implicit val cloudUserDetailsReads = Json.reads[CloudUserDetails]
  implicit val cloudUserDetailsWrites = Json.writes[CloudUserDetails]

  implicit val bucketReads = Json.reads[Bucket]
  implicit val bucketWrites = Json.writes[Bucket]

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

  implicit val amazonS3ErrorReads = Json.reads[AmazonS3Error]
  implicit val amazonS3ErrorWrites = Json.writes[AmazonS3Error]

}
