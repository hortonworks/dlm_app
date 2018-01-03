/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

package services

import java.io.{ByteArrayInputStream, ObjectInputStream}

import com.google.common.cache.{CacheBuilder, CacheLoader, LoadingCache}
import com.hortonworks.dataplane.commons.service.api.{CredentialManager, KeystoreReloadEvent}
import com.google.inject.{Inject, Singleton}
import com.typesafe.scalalogging.Logger
import models.AmazonS3Entities.Error._
import models.AmazonS3Entities.{CloudAccount, CloudAccountWithCredential, CloudAccounts, Error}
import play.api.cache._

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future
import org.apache.commons.lang.SerializationUtils

import scala.collection.mutable
import scala.util.{Failure, Success, Try}

@Singleton
class DlmKeyStore @Inject()(cache: CacheApi, credentialManager: CredentialManager) extends
  mutable.Subscriber[KeystoreReloadEvent, mutable.Publisher[KeystoreReloadEvent]] {

  private val logger = Logger(classOf[DlmKeyStore])
  private val cloudAccountsCache: LoadingCache[String,Future[Either[CredentialNotFoundInKeystoreError,List[CloudAccountWithCredential]]]] =
    CacheBuilder.newBuilder().build(new CloudAccountsCacheLoader())

  // subscribe for events
  credentialManager.subscribe(this)

  override def notify(publisher: mutable.Publisher[KeystoreReloadEvent], event: KeystoreReloadEvent): Unit = {
    cloudAccountsCache.invalidate(DpKeyStore.ALIAS)
  }

  private class CloudAccountsCacheLoader extends
    CacheLoader[String,Future[Either[CredentialNotFoundInKeystoreError,List[CloudAccountWithCredential]]]] {
    override def load(key: String): Future[Either[CredentialNotFoundInKeystoreError,List[CloudAccountWithCredential]]] = {
      getCloudAccountsFromKeyStore(key)
    }
  }

  /**
    * List all cloud account names
    */
  def getAllCloudAccountNames : Future[Either[CredentialNotFoundInKeystoreError,CloudAccounts]] = {
    cloudAccountsCache.get(DpKeyStore.ALIAS) map {
      case Right(cloudAccounts) =>
        Right(CloudAccounts(cloudAccounts.map(x => CloudAccount(x.cloudAccount.accountId, x.cloudAccount.userName))))
      case Left(error) => Right(CloudAccounts(List()))
    }
  }

  /**
    * Get cloud account
    */
  def getCloudAccount(cloudAccount: CloudAccount) : Future[Either[CredentialNotFoundInKeystoreError,CloudAccountWithCredential]] = {
    cloudAccountsCache.get(DpKeyStore.ALIAS) map {
      case Right(cloudAccounts) =>
        cloudAccounts.find(x => x.cloudAccount == cloudAccount) match {
          case Some(result) => Right(result)
          case None => Left(CredentialNotFoundInKeystoreError(DpKeyStore.credentialDoesNotExistsErrMsg))
        }

      case Left(error) => Left(error)
    }
  }

  /**
    * List all cloud accounts
    */
  def getAllCloudAccounts : Future[Either[CredentialNotFoundInKeystoreError,List[CloudAccountWithCredential]]] = {
    cloudAccountsCache.get(DpKeyStore.ALIAS) map {
      case Right(cloudAccounts) => Right(cloudAccounts)
      case Left(error) => Right(List())
    }
  }

  /**
    * Update a cloud account
    * @param cloudAccountWithCredential
    */
  def updateCloudAccount(cloudAccountWithCredential: CloudAccountWithCredential) : Future[Either[GenericError,Unit]] = {
    getCloudAccountsFromKeyStore(DpKeyStore.ALIAS) map {
      case Right(cloudAccountsWithCredentials) =>
        val otherAccounts = cloudAccountsWithCredentials.filterNot(elm => elm.cloudAccount == cloudAccountWithCredential.cloudAccount)
        if (otherAccounts.lengthCompare(cloudAccountsWithCredentials.length) != 0) {
          saveCloudAccountsToKeyStore(otherAccounts :+ cloudAccountWithCredential) match {
            case Success(v) => Right(Unit)
            case Failure(ex) => Left(GenericError(ex.getMessage))
          }
        } else {
          Left(GenericError(DpKeyStore.credentialDoesNotExistsErrMsg))
        }
      case Left(error) => Left(GenericError(error.message))
    }
  }

  /**
    * Add cloud account
    * @param cloudAccount
    */
  def addCloudAccount(cloudAccount: CloudAccountWithCredential) : Future[Either[KeyStoreWriteError,Unit]] = {
    getCloudAccountsFromKeyStore(DpKeyStore.ALIAS) map {
      case Right(cloudAccounts) =>
        if (cloudAccounts.contains(cloudAccount)) {
          Left(KeyStoreWriteError(DpKeyStore.credentialNameExistsErrMsg))
        } else {
          saveCloudAccountsToKeyStore(cloudAccounts :+ cloudAccount) match {
            case Success(v) => Right(Unit)
            case Failure(ex) => Left(KeyStoreWriteError(ex.getMessage))
          }
        }
      case Left(error) =>
        saveCloudAccountsToKeyStore(List(cloudAccount)) match {
          case Success(v) => Right(Unit)
          case Failure(ex) => Left(KeyStoreWriteError(ex.getMessage))
      }
    }
  }

  /**
    * Deletes a cloud account
    * @param cloudAccount
    */
  def deleteCloudAccount(cloudAccount: CloudAccount) : Future[Either[GenericError,Unit]] = {
    getCloudAccountsFromKeyStore(DpKeyStore.ALIAS) map {
      case Right(cloudAccounts) =>
        val cloudAccountsToBeSaved = cloudAccounts.filterNot(x => x.cloudAccount == cloudAccount)
        if (cloudAccounts.lengthCompare(cloudAccountsToBeSaved.length) != 0) {
          saveCloudAccountsToKeyStore(cloudAccountsToBeSaved) match {
            case Success(v) => Right(Unit)
            case Failure(ex) => Left(GenericError(ex.getMessage))
          }
        } else {
          Left(GenericError(DpKeyStore.credentialDoesNotExistsErrMsg))
        }
      case Left(error) => Left(GenericError(error.message))
    }
  }

  def saveCloudAccountsToKeyStore(cloudAccountsInfo: List[CloudAccountWithCredential]): Try[Unit] = {
    val serializedCloudAccount = SerializationUtils.serialize(cloudAccountsInfo)
    credentialManager.write(DpKeyStore.ALIAS, Map(DpKeyStore.KEY -> serializedCloudAccount)) map {
     _ => cloudAccountsCache.invalidate(DpKeyStore.ALIAS)
    }
  }

  /**
    * Get all cloud accounts
    * @param alias
    * @return
    */
  def getCloudAccountsFromKeyStore (alias: String): Future[Either[CredentialNotFoundInKeystoreError,List[CloudAccountWithCredential]]] =  {
    credentialManager.read(alias, Set(DpKeyStore.KEY)) match {
      case Success(keyValueMap) =>
        keyValueMap.get(DpKeyStore.KEY) match {
          case Some(result) =>
            val byteInputStream = new ByteArrayInputStream(result)
            val ois = new ObjectInputStream(byteInputStream) {
              override def resolveClass(desc: java.io.ObjectStreamClass): Class[_] = {
                try {
                  Class.forName(desc.getName, false, getClass.getClassLoader)
                } catch {
                  case ex: ClassNotFoundException => super.resolveClass(desc)
                }
              }
            }
            val value = ois.readObject.asInstanceOf[List[CloudAccountWithCredential]]
            ois.close()
            Future.successful(Right(value))

          case None =>
            val message = DpKeyStore.credentialDoesNotExistsErrMsg
            logger.error(message)
            Future.successful(Left(CredentialNotFoundInKeystoreError(message)))
        }

      case Failure(ex) => 
        logger.error(ex.getMessage)
        Future.successful(Left(CredentialNotFoundInKeystoreError(ex.getMessage)))
    }
  }

}

object DpKeyStore {
  lazy val ALIAS = "DLM"
  lazy val KEY = "_BUCKET"
  def getCloudAccountErrMsg = "Unexpected response on deserialization of cloud accounts"
  def credentialNameExistsErrMsg = "Credential name already exists. Please use another name for the cloud credentials"
  def credentialDoesNotExistsErrMsg = "Credential for the given accountName does not exists"
}