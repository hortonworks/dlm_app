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

import org.scalamock.scalatest.AsyncMockFactory
import org.scalatest.{AsyncFlatSpec, Matchers}
import org.scalatest.TryValues._

class CredentialManagerSpec extends AsyncFlatSpec with AsyncMockFactory with Matchers {

  private val keyStoreFile = getClass.getResource("/dp-test-keystore.jceks")
  private val credentialManager = new CredentialManager(keyStoreFile.getPath,"changeit")

  "CredentialManager" should "write credentials to the keystore" in {
    val result = credentialManager.writeUserCredential("DPSPlatform.test.credential","test","test@123")
    assert(result.isSuccess)
  }

  "CredentialManager" should "read credentials from the keystore" in {
    val result = credentialManager.readUserCredential("DPSPlatform.test.credential")
    assert(result.isSuccess)
    assert(result.success.value._1 === "test")
    assert(result.success.value._2 === "test@123")
  }

  "CredentialManager" should "throw exception if a key read is not present in the keystore" in {
    val result = credentialManager.readUserCredential("xyz.credential")
    assert(result.isFailure)
    result.failure.exception shouldBe a [CredentialNotFoundInKeystoreException]
  }

}
