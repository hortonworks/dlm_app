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

import scala.util.Try

class KeyStoreManagerSpec extends AsyncFlatSpec with AsyncMockFactory with Matchers {

  private val keyStoreFile = getClass.getResource("/dp-test-keystore.jceks")
  private val keyStoreManager = new KeyStoreManager(keyStoreFile.getPath,"changeit")

  "KeyStoreManager" should "write to key store" in {
    val res: Try[Unit] = keyStoreManager.write("DPSPlatform.test",Map("username" -> "testuser".getBytes("UTF-8"), "password" -> "testpass".getBytes("UTF-8")))
    assert(res.isSuccess === true)
  }

  "KeyStoreManager" should "read from keystore" in {
    val res = keyStoreManager.read("DPSPlatform.test", Set("username","password"))
    assert(res.isSuccess === true)
    assert(res.success.value.values.toList.map(x => new String(x, "UTF-8")) === List("testuser", "testpass"))
  }

  "KeyStoreManager" should "throw exception if key is not found" in {
    val res = keyStoreManager.read("DPSPlatform.test123", Set("username","password"))
    assert(res.isFailure === true)
    res.failure.exception shouldBe a [CredentialNotFoundInKeystoreException]
  }

}
