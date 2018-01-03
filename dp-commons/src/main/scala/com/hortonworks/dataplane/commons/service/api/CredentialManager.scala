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
import scala.util.{Try, Success, Failure}

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

  def readUserCredential(alias: String): Try[(String, String)] = {
    read(alias, Set("username","password")) match {
      case Success(keyValueMap) => keyValueMap.values.toList.map(x => new String(x, "UTF-8")) match {
        case List(username, password) => Try {(username, password)}
      }
      case Failure(t) => throw t
    }
  }

  def read(alias: String, keys: Set[String]): Try[Map[String, Array[Byte]]] = {
    keystore.map { keystore =>
      (for {
        key <- keys
        value = if (!keystore.containsAlias(s"$alias.$key")) {
            throw CredentialNotFoundInKeystoreException(s"Credential not found for key $key of $alias")
          } else {
            keystore.getKey(s"$alias.$key", storePassword.toCharArray).getEncoded
          }

      } yield {
        key -> value
      }).toMap
    }
  }

  def writeUserCredential(key: String, username: String, password: String): Try[Unit] = {
    write(key, Map("username" -> username.getBytes("UTF-8"), "password" -> password.getBytes("UTF-8")))
  }

  def write(alias: String, keyValueMap: Map[String, Array[Byte]]): Try[Unit] = {
    keystore.map { keystore =>
      keyValueMap foreach {
        case (key, value) =>
          if (keystore.containsAlias(s"$alias.$key")) {
            keystore.deleteEntry(s"$alias.$key")
          }
          keystore.setKeyEntry(s"$alias.$key", new SecretKeySpec(value, "AES"), storePassword.toCharArray, null)
      }
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

object CredentialManager {
  def apply(storePath: String, storePassword: String): CredentialManager = new CredentialManager(storePath, storePassword)
}
