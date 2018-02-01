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

package com.hortonworks.dataplane.commons.service.api

import scala.collection.mutable
import scala.util.Try

case class CredentialReloadEvent()

class CredentialManager(private val storePath: String, private val storePassword: String) extends mutable.Publisher[CredentialReloadEvent] with mutable.Subscriber[KeystoreReloadEvent, mutable.Publisher[KeystoreReloadEvent]] {

  private val keyStoreManager = new KeyStoreManager(storePath, storePassword)

  keyStoreManager.subscribe(this)

  def readUserCredential(alias: String): Try[(String, String)] = {
    keyStoreManager.read(alias, Set("username", "password")).map {
      x => {
        x.values.toList.map(x => new String(x, "UTF-8")) match {
          case List(username, password) => (username, password)
        }
      }
    }
  }

  def writeUserCredential(key: String, username: String, password: String): Try[Unit] = {
    keyStoreManager.write(key, Map("username" -> username.getBytes("UTF-8"), "password" -> password.getBytes("UTF-8")))
  }

  override def notify(publisher: mutable.Publisher[KeystoreReloadEvent], event: KeystoreReloadEvent): Unit = {
    publish(CredentialReloadEvent())
  }
}

object CredentialManager {
  def apply(storePath: String, storePassword: String): CredentialManager = new CredentialManager(storePath, storePassword)
}
