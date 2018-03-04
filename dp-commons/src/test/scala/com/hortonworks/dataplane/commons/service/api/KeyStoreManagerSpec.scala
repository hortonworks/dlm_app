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

import java.io.{File, IOException}
import java.nio.file.Paths

import org.scalamock.scalatest.AsyncMockFactory
import org.scalatest.{AsyncFlatSpec, BeforeAndAfterAll, Matchers}
import org.scalatest.TryValues._

import sys.process._
import scala.util.Try

class KeyStoreManagerSpec extends AsyncFlatSpec with AsyncMockFactory with Matchers with BeforeAndAfterAll {
  private val randomGenerator = new scala.util.Random()
  private val keyStoreFilePath = s"${Paths.get("").toAbsolutePath.toString}/test-${randomGenerator.nextInt()}.jceks"
  private val keyStorePassword = "changeit"
  private val keyStoreFile = s"keytool -genseckey -keystore $keyStoreFilePath -storetype jceks -storepass $keyStorePassword -alias jceksaes -keypass mykeypass" !!
  private val keyStoreManager = new KeyStoreManager(keyStoreFilePath, keyStorePassword)


  override def afterAll(): Unit ={
    val file:File = new File(keyStoreFilePath)
    file.delete()
  }

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

  "keyStoreManager" should "throw IOException if key store password is incorrect" in {
    val ksManager = new KeyStoreManager(keyStoreFilePath, "incorrectpass")
    val res = ksManager.read("DPSPlatform.test123", Set("username","password"))
    assert(res.isFailure === true)
    res.failure.exception shouldBe a [IOException]
  }

  "keyStoreManager" should "throw IOException if key store path is incorrect" in {
    val ksManager = new KeyStoreManager("incorrect/path", keyStorePassword)
    val res = ksManager.read("DPSPlatform.test123", Set("username","password"))
    assert(res.isFailure === true)
    res.failure.exception shouldBe a [IOException]
  }
}
