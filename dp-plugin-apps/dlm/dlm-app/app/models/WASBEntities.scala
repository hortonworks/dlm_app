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

import models.WASBEntities.Error._
import models.CloudAccountEntities.{CloudAccountCredentials, CloudAccountDetails}
import models.CloudAccountProvider.CloudAccountProvider
import models.CloudCredentialType.CloudCredentialType
import models.CloudResponseEntities.{FileListItem, FileListResponse}
import play.api.libs.json.Json

object WASBEntities {
  sealed trait Error
  object Error {
    final case class WASBClientError(message: String) extends Error
  }

  @SerialVersionUID(131)
  case class WASBAccountDetails(provider: String, credentialType: Option[CloudCredentialType], accountName: String) extends Serializable with CloudAccountDetails

  @SerialVersionUID(132)
  case class WASBAccountCredential(credentialType: String, accessKey: String) extends Serializable with CloudAccountCredentials
  @SerialVersionUID(133)
  case class WASBAccountCredentialSAS(credentialType: String, token: String) extends Serializable with CloudAccountCredentials

  case class BlobListItem(pathSuffix: String, `type`: String, modificationTime: Option[Long], length: Option[Long]) extends FileListItem
  case class BlobListResponse(fileList: Seq[BlobListItem], provider: CloudAccountProvider = CloudAccountProvider.WASB) extends FileListResponse


  implicit val wasbClientErrorWrites = Json.writes[WASBClientError]
  implicit val wasbClientErrorReads = Json.reads[WASBClientError]

}

