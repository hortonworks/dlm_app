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
import play.api.libs.json.Json

object ADLSEntities {
  @SerialVersionUID(141)
  case class ADLSAccountDetails(provider: String, accountName: String) extends Serializable with CloudAccountDetails {
    override def getAccountId(): String = accountName
  }
  @SerialVersionUID(142)
  case class ADLSAccountCredentials(credentialType: String, clientId: String, authTokenEndpoint: String, clientSecret: String) extends Serializable with CloudAccountCredentials
  case class ADLSFile(pathSuffix: String, accessTime: Long, modificationTime: Long, blockSize: Long,
                      permission: String, length: Long, replication: Int, owner: String, group: String, `type`: String)
  case class ADLSFilesResponse(fileList: Seq[ADLSFile])

  implicit val adlsFileFmt = Json.format[ADLSFile]
  implicit val adlsFilesResponseFmt = Json.format[ADLSFilesResponse]
}

