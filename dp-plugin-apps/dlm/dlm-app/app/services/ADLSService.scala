/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

package services

import com.google.inject.{Inject, Singleton}
import com.microsoft.azure.datalake.store.{ADLStoreClient, DirectoryEntry, DirectoryEntryType}
import com.microsoft.azure.datalake.store.oauth2.{AccessTokenProvider, ClientCredsTokenProvider}
import models.ADLSEntities.{ADLSAccountCredentials, ADLSAccountDetails, ADLSFile, ADLSFilesResponse}
import models.CloudAccountEntities.Error.GenericError
import models.CloudCredentialType

import scala.concurrent.Future
import scala.collection.JavaConverters._
import scala.concurrent.ExecutionContext.Implicits.global

/**
  * Azure Data Lake Store Client.
  * Note: There is no standard way to check user identity
  */
@Singleton()
class ADLSService @Inject()(val dlmKeyStore: DlmKeyStore) {
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
            Right(ADLStoreClient.createClient(getAccountFqdn(details.accountName), provider))
          }
        }
      }
      case Left(err) => Left(GenericError(err.message))
    }
  }

  def getFiles(accountId: String, path: String): Future[Either[GenericError, ADLSFilesResponse]] = {
    getClient(accountId) map {
      case Right(client) => {
        try {
          var files: Seq[ADLSFile] = Seq()
          for (file: DirectoryEntry <- client.enumerateDirectory(path).asScala) {
            files = files :+ ADLSFile(
              file.name,
              file.lastAccessTime.getTime,
              file.lastModifiedTime.getTime,
              file.blocksize,
              file.permission,
              file.length,
              file.replicationFactor,
              file.user,
              file.group,
              if (file.`type` == DirectoryEntryType.FILE) "FILE" else "DIRECTORY"
            )
          }
          Right(ADLSFilesResponse(files))
        } catch {
          case e: Exception => Left(GenericError(e.getMessage))
        }
      }
      case Left(err) => Left(err)
    }
  }
}
