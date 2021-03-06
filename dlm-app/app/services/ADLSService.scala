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

package services

import com.google.inject.{Inject, Singleton}
import com.microsoft.azure.datalake.store.{ADLStoreClient, DirectoryEntry, DirectoryEntryType}
import com.microsoft.azure.datalake.store.oauth2.{AccessTokenProvider, ClientCredsTokenProvider}
import models.ADLSEntities.{ADLSAccountCredentials, ADLSAccountDetails, ADLSFileItem, ADLSFileListResponse}
import models.CloudAccountEntities.Error.GenericError
import models.{CloudAccountProvider, CloudAccountStatus, CloudCredentialType}
import models.CloudResponseEntities.{FileListResponse, MountPointDefinition, MountPointsResponse}
import models.Entities.CloudCredentialStatus

import scala.concurrent.Future
import scala.collection.JavaConverters._
import scala.concurrent.ExecutionContext.Implicits.global

/**
  * Azure Data Lake Store Client.
  * Note: There is no standard way to check user identity
  */
@Singleton()
class ADLSService @Inject()(val dlmKeyStore: DlmKeyStore) extends CloudService {
  private def getAccountFqdn(accountName: String): String = {
    s"$accountName.azuredatalakestore.net"
  }

  private def getClient(accountId: String): Future[Either[GenericError, ADLStoreClient]] = {
    dlmKeyStore.getCloudAccount(accountId) map {
      case Right(cloudAccount) => {
        CloudCredentialType.withName(cloudAccount.accountCredentials.credentialType) match {
          case CloudCredentialType.ADLS_STS => {
            val details: ADLSAccountDetails = cloudAccount.accountDetails.asInstanceOf[ADLSAccountDetails]
            val credential = cloudAccount.accountCredentials.asInstanceOf[ADLSAccountCredentials]
            val provider: AccessTokenProvider = new ClientCredsTokenProvider(credential.authTokenEndpoint, credential.clientId, credential.clientSecret)
            Right(ADLStoreClient.createClient(getAccountFqdn(details.accountName.get), provider))
          }
        }
      }
      case Left(err) => Left(GenericError(err.message))
    }
  }

  def listFiles(accountId: String, containerName: String, path: String): Future[Either[GenericError, FileListResponse]] = {
    getClient(accountId) map {
      case Right(client) => {
        try {
          var files: Seq[ADLSFileItem] = Seq()
          for (file: DirectoryEntry <- client.enumerateDirectory(path).asScala) {
            files = files :+ ADLSFileItem(
              file.name,
              file.lastAccessTime.getTime,
              Some(file.lastModifiedTime.getTime),
              file.blocksize,
              file.permission,
              Some(file.length),
              file.replicationFactor,
              file.user,
              file.group,
              if (file.`type` == DirectoryEntryType.FILE) "FILE" else "DIRECTORY"
            )
          }
          Right(ADLSFileListResponse(files))
        } catch {
          case e: Exception => Left(GenericError(e.getMessage))
        }
      }
      case Left(err) => Left(err)
    }
  }


  /**
    * Lists "DEFAULT" as the single mountpoint for ADLS
    * Note that ADLS does not have a native notion of Container/Bucket. This is to keep consistency with S3/WASB APIs
    * @param accountId
    * @return
    */
  override def listMountPoints(accountId: String): Future[Either[GenericError, MountPointsResponse]] = {
    Future.successful(Right(MountPointsResponse(List(MountPointDefinition(ADLSService.deafultMountPoint)))))
  }

  // todo: need to check another way to check identity since if credential isn't valid azure-sdk
  // will throw error only after timeout
  override def checkUserIdentityValid(accountId: String): Future[Either[GenericError, CloudCredentialStatus]] = {
    listFiles(accountId, ADLSService.deafultMountPoint, "/") map {
      case Left(err) =>  Left(err)
      case _ => Right(CloudCredentialStatus(accountId, CloudAccountStatus.ACTIVE))
    }
  }
}

object ADLSService {
  val deafultMountPoint = "DEFAULT"
}
