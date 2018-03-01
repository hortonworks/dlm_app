/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

package models

import models.CloudAccountEntities.{CloudAccountCredentials, CloudAccountDetails}
import models.CloudAccountProvider.CloudAccountProvider
import models.CloudCredentialType.CloudCredentialType
import models.CloudResponseEntities.{FileListItem, FileListResponse}
import play.api.libs.json.Json

object ADLSEntities {
  @SerialVersionUID(141)
  case class ADLSAccountDetails(provider: String, credentialType: Option[CloudCredentialType], accountName: Option[String]) extends Serializable with CloudAccountDetails

  @SerialVersionUID(142)
  case class ADLSAccountCredentials(credentialType: String, clientId: String, authTokenEndpoint: String, clientSecret: String) extends Serializable with CloudAccountCredentials

  case class ADLSFileItem(pathSuffix: String, accessTime: Long, modificationTime: Option[Long], blockSize: Long,
                          permission: String, length: Option[Long], replication: Int, owner: String, group: String, `type`: String) extends FileListItem
  case class ADLSFileListResponse(fileList: Seq[ADLSFileItem], provider: CloudAccountProvider = CloudAccountProvider.ADLS) extends FileListResponse
}

