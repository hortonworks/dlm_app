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

package com.hortonworks.dataplane.cs.utils

import java.io.{File, FileInputStream, FileOutputStream}
import java.net.URL
import javax.inject.Inject

import com.typesafe.config.Config
import com.typesafe.scalalogging.Logger

import scala.util.Try

object SSLUtils {

  /**
    * Constructs a keystore
    * @param config
    */
  class DPTrustStore @Inject()(private val config: Config) {

    // get the users home dir
    val baseDir = config.getString("dp.services.keystore.base.path")
    val keystoreDir = config.getString("dp.services.keystore.path")
    val keystoreName = config.getString("dp.services.keystore.name")
    val keystorePass = config.getString("dp.services.keystore.pass")
    private val dir = new File(s"$baseDir/$keystoreDir")

    private lazy val log = Logger(classOf[DPTrustStore])

    // Create if not exists
    if (!dir.exists()) {
      dir.mkdirs()
      log.info(s"Keystore base directory does not exist, creating one at $baseDir")
    }

    // construct a keystore
    import java.security.KeyStore

    // The private keystore handle
    val keyStore = KeyStore.getInstance(KeyStore.getDefaultType)
    private val keyStoreFileHandle = new File(dir, keystoreName)

    if (keyStoreFileHandle.exists()) {
      // load the keystore
      log.info(s"Keystore exists at ${keyStoreFileHandle.getAbsolutePath}")
      val stream = new FileInputStream(keyStoreFileHandle)
      try {
        log.info("Loaded keystore")
        keyStore.load(stream, keystorePass.toCharArray)
      } finally {
        stream.close()
      }
    } else {
      log.info(s"Creating new keystore at ${keyStoreFileHandle.getAbsolutePath}")
      keyStore.load(null, null)
      val stream = new FileOutputStream(keyStoreFileHandle)
      try {
        keyStore.store(stream, keystorePass.toCharArray)
      } finally {
        stream.close()
      }

      //add a default certificate
      log.info("Installing a default certificate")
      val st = certAsStream
      import java.security.cert.CertificateFactory
      val cf = CertificateFactory.getInstance("X.509")
      val out = new FileOutputStream(keyStoreFileHandle)
      try {
        val certs = cf.generateCertificate(st)
        keyStore.setCertificateEntry("hwsite", certs)
        keyStore.store(out, keystorePass.toCharArray)
      } finally {
        st.close()
        out.close()
      }


    }

    private val installer =
      new CertificateInstaller(keyStore, keystorePass, keyStoreFileHandle)

    import java.io.{ByteArrayInputStream, IOException}

    @throws[IOException]
    private def certAsStream = {
      import com.google.common.io.ByteStreams
      val bytes = ByteStreams.toByteArray(
        this.getClass.getClassLoader.getResourceAsStream("hw.crt"))
      new ByteArrayInputStream(bytes)
    }

    // make sure we close everything on shutdown
    if (Try(config.getBoolean("dp.services.keystore.removeOnExit"))
          .getOrElse(false)) {
      keyStoreFileHandle.deleteOnExit()
    }

    def getKeyStoreFilePath = {
      keyStoreFileHandle.getAbsolutePath
    }

    def storeCertificate(url: URL): Try[Boolean] = {
      Try {
        if (installer.shouldSave(url)) {
          log.info(s"Installing new certificate for url $url")
          installer.saveCert(url)
          true
        } else false
      }
    }
  }
}
