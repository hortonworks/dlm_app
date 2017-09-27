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

import java.io.{FileInputStream, FileOutputStream, InputStream, OutputStream}
import java.nio.file.{Path, Paths}
import java.security.KeyStore
import javax.crypto.spec.SecretKeySpec

import scala.collection.mutable
import scala.util.Try

case class KeystoreReloadEvent()

class CredentialManager(private val storePath: String, private val storePassword: String) extends mutable.Publisher[KeystoreReloadEvent] {

  //  initialize
  private var keystore = load(storePath, storePassword)
  private val watcher = new ThreadFileMonitor(Paths.get(storePath)) {
    override def onChange(path: Path): Unit = {
      keystore = load(storePath, storePassword)

      // publishing event
      publish(KeystoreReloadEvent())
    }
  }
  watcher.start()

  def read(key: String): Try[(String, String)] = {
    keystore
      .map { keystore =>
        if (!keystore.containsAlias(s"$key.username") || !keystore.containsAlias(s"$key.password")) {
          throw CredentialNotFoundInKeystoreException(s"Credential not found for key $key")
        } else {
          val username = new String(keystore.getKey(s"$key.username", storePassword.toCharArray).getEncoded, "UTF-8")
          val password = new String(keystore.getKey(s"$key.password", storePassword.toCharArray).getEncoded, "UTF-8")

          (username, password)
        }
      }
  }

  def write(key: String, username: String, password: String): Try[Unit] = {
    keystore
      .map { keystore =>
        if (keystore.containsAlias(s"$key.username")) {
          keystore.deleteEntry(s"$key.username")
        }
        if(keystore.containsAlias(s"$key.password")){
          keystore.deleteEntry(s"$key.password")
        }

        keystore.setKeyEntry(s"$key.username", new SecretKeySpec(username.getBytes("UTF-8"), "AES"), storePassword.toCharArray, null)
        keystore.setKeyEntry(s"$key.password", new SecretKeySpec(password.getBytes("UTF-8"), "AES"), storePassword.toCharArray, null)

        flush(storePath, storePassword, keystore)
      }
  }

  private def load(storePath: String, storePassword: String): Try[KeyStore] = Try({
    var is: InputStream = null
    var keystore: KeyStore = null
    try {
      is = new FileInputStream(storePath)
      keystore = KeyStore.getInstance("JCEKS")
      keystore.load(is, storePassword.toCharArray)
    } finally {
      if (is != null) {
        is.close()
      }
    }
    keystore
  })

  private def flush(storePath: String, storePassword: String, keystore: KeyStore): Try[Unit] = Try({
    var os: OutputStream = null
    try {
      os = new FileOutputStream(storePath)
      keystore.store(os, storePassword.toCharArray)
    } finally {
      if(os != null) {
        println("close after flush")
        os.close()
      }
    }
  })
}
