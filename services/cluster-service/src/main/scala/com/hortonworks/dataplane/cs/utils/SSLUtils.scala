package com.hortonworks.dataplane.cs.utils

import java.io.{File, FileInputStream, FileOutputStream}
import java.net.URL
import javax.inject.Inject

import com.typesafe.config.Config

import scala.util.Try

object SSLUtils {

  /**
    * Constructs a keystore
    * @param config
    */
  class DPKeystore @Inject()(private val config:Config) {

    // get the users home dir
    val userHome = System.getProperty("user.home")
    val keystoreDir = Try(config.getString("dp.services.keystore.path")).getOrElse(".dp_keystore")
    val keystoreName = Try(config.getString("dp.services.keystore.name")).getOrElse("dp_certs_store")
    val keystorePass = Try(config.getString("dp.services.keystore.pass")).getOrElse("changeit")
    private val dir = new File(s"$userHome/$keystoreDir")

    // Create if not exists
    if(!dir.exists())
      dir.mkdirs()

    // construct a keystore
    import java.security.KeyStore

    // The private keystore
    val keyStore = KeyStore.getInstance(KeyStore.getDefaultType)
    private val keyStoreFileHandle = new File(dir,keystoreName)

    if(keyStoreFileHandle.exists()){
        // load the keystore
      val stream = new FileInputStream(keyStoreFileHandle)
      keyStore.load(stream,keystorePass.toCharArray)
      stream.close()
    } else {
      keyStore.load(null,null)
      val stream = new FileOutputStream(keyStoreFileHandle)
      keyStore.store(stream,keystorePass.toCharArray)
      stream.close()

      //add a default certificate
      val st = asStream
      import java.security.cert.CertificateFactory
      val cf = CertificateFactory.getInstance("X.509")
      val certs = cf.generateCertificate(st)
      keyStore.setCertificateEntry("hwsite", certs)
      st.close()
      val out = new FileOutputStream(keyStoreFileHandle)
      keyStore.store(out, keystorePass.toCharArray)
      out.close()

    }

    val installer = new CertificateInstaller(keyStore,keystorePass,keyStoreFileHandle)


    import java.io.{ByteArrayInputStream, IOException}

    @throws[IOException]
    private def asStream = {
      import com.google.common.io.ByteStreams
      val bytes = ByteStreams.toByteArray(this.getClass.getClassLoader.getResourceAsStream("hw.crt"))
      val bais = new ByteArrayInputStream(bytes)
      bais
    }




    // make sure we close everything on shutdown
    if(Try(config.getBoolean("dp.services.keystore.removeOnExit")).getOrElse(false)) {
      keyStoreFileHandle.deleteOnExit()
    }


    def getKeyStoreFilePath = {
      keyStoreFileHandle.getAbsolutePath
    }

    def storeCertificate(url: URL) = {
        if(installer.shouldSave(url))
        installer.saveCert(url)
    }
  }
}
