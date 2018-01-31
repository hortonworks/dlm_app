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

import scala.util.Try

class CredentialManager(private val storePath: String, private val storePassword: String) extends KeyStoreManager(storePath, storePassword) {

  def readUserCredential(alias: String): Try[(String, String)] = {
    read(alias, Set("username", "password")).map {
      x => {
        x.values.toList.map(x => new String(x, "UTF-8")) match {
          case List(username, password) => (username, password)
        }
      }
    }
  }

  def writeUserCredential(key: String, username: String, password: String): Try[Unit] = {
    write(key, Map("username" -> username.getBytes("UTF-8"), "password" -> password.getBytes("UTF-8")))
  }
}

object CredentialManager {
  def apply(storePath: String, storePassword: String): CredentialManager = new CredentialManager(storePath, storePassword)
}
