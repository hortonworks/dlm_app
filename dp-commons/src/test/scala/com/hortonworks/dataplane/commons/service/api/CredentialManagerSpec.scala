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

import java.io.File

import org.scalamock.scalatest.AsyncMockFactory
import org.scalatest.{AsyncFlatSpec, BeforeAndAfterEach, Matchers}
import org.scalatest.TryValues._

import sys.process._

class CredentialManagerSpec extends AsyncFlatSpec with AsyncMockFactory with Matchers with BeforeAndAfterEach {

  private val keyStoreFilePath = "/tmp/test.jceks"
  private val keyStorePassword = "changeit"

  override def afterEach(): Unit ={
    val file:File = new File(keyStoreFilePath)
    file.delete()
  }

  "CredentialManager" should "write credentials to the keystore" in {
    s"keytool -genseckey -keystore $keyStoreFilePath -storetype jceks -storepass $keyStorePassword -alias jceksaes -keypass mykeypass" !!
    val credentialManager = new CredentialManager(keyStoreFilePath, keyStorePassword)
    val result = credentialManager.writeUserCredential("DPSPlatform.test.credential","test","test@123")
    assert(result.isSuccess)
  }

  "CredentialManager" should "read credentials from the keystore" in {
    s"keytool -genseckey -keystore $keyStoreFilePath -storetype jceks -storepass $keyStorePassword -alias jceksaes -keypass mykeypass" !!
    val credentialManager = new CredentialManager(keyStoreFilePath, keyStorePassword)
    credentialManager.writeUserCredential("DPSPlatform.test.credential","test","test@123")
    val result = credentialManager.readUserCredential("DPSPlatform.test.credential")
    assert(result.isSuccess)
    assert(result.success.value._1 === "test")
    assert(result.success.value._2 === "test@123")
  }

  "CredentialManager" should "throw exception if a key read is not present in the keystore" in {
    s"keytool -genseckey -keystore $keyStoreFilePath -storetype jceks -storepass $keyStorePassword -alias jceksaes -keypass mykeypass" !!
    val credentialManager = new CredentialManager(keyStoreFilePath, keyStorePassword)
    val result = credentialManager.readUserCredential("xyz.credential")
    assert(result.isFailure)
    result.failure.exception shouldBe a [CredentialNotFoundInKeystoreException]
  }

}
