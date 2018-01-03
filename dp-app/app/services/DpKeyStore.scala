/*
 *
 *  * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *  *
 *  * Except as expressly permitted in a written agreement between you or your company
 *  * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 *  * reproduction, modification, redistribution, sharing, lending or other exploitation
 *  * of all or any part of the contents of this software is strictly prohibited.
 *
 */

package services

import com.hortonworks.dataplane.commons.service.api.CredentialManager
import javax.inject.Singleton

import play.api.Configuration
import com.google.inject.Inject
import com.typesafe.scalalogging.Logger
import models.CredentialEntry

import scala.util.Try

@Singleton
class DpKeyStore @Inject()(configuration: Configuration) {
  private val logger = Logger(classOf[DpKeyStore])

  private val storePath = configuration.getString("dp.keystore.path").get
  private val storePassword = configuration.getString("dp.keystore.password").get

  val credentialManager = new CredentialManager(storePath, storePassword)

  def getCredentialEntry(alias: String): Try[CredentialEntry] = {
    credentialManager.readUserCredential(alias)
      .map { credential => CredentialEntry(alias, credential._2)}
  }

  def createCredentialEntry(alias: String, password: String): Try[Unit] = credentialManager.writeUserCredential(alias, "dummy", password)
}
