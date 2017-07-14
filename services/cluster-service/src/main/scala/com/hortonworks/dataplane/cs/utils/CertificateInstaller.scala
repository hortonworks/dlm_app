package com.hortonworks.dataplane.cs.utils

import java.io.{File, FileOutputStream}
import java.net.URL
import java.security.KeyStore
import java.security.cert.X509Certificate
import java.util.concurrent.atomic.AtomicReference
import javax.net.ssl.{SSLContext, TrustManagerFactory, X509TrustManager}

import com.typesafe.scalalogging.Logger

import scala.util.{Failure, Success, Try}

class CertificateInstaller(keyStore: KeyStore,
                           pass: String,
                           keystoreFile: File) {

  private lazy val context: SSLContext = SSLContext.getInstance("TLS")
  private val tmf =
    TrustManagerFactory.getInstance(TrustManagerFactory.getDefaultAlgorithm)
  tmf.init(keyStore)
  private lazy val dtm =
    tmf.getTrustManagers.head.asInstanceOf[X509TrustManager]

  private lazy val tm = CsTrustManager(dtm)

  context.init(null, Array(tm), null)

  private lazy val socketFactory = context.getSocketFactory

  private lazy val log = Logger(classOf[CertificateInstaller])

  def shouldSave(url: URL) = !keyStore.containsAlias(url.getHost)

  def saveCert(url: URL) = {
    import javax.net.ssl.SSLSocket
    val socket = socketFactory
      .createSocket(url.getHost, url.getPort)
      .asInstanceOf[SSLSocket]
    try {
      log.info("Starting SSL handshake")
      socket.startHandshake()
    } finally {
      log.info("Closing SSL socket")
      socket.close()
    }

    val chain = tm.chain
    val option = chain.find(c => c.isInstanceOf[X509Certificate])
    val cert = option.map(c => Some(c)).getOrElse(None)
    if (cert.isDefined && !keyStore.containsAlias(url.getHost)) {
      log.info("Got a X509 certificate!")
      log.debug(s"Certificate - $cert")
      keyStore.setCertificateEntry(url.getHost, cert.get)
      val out = new FileOutputStream(keystoreFile)
      try {
        keyStore.store(out, pass.toCharArray)
      } finally {
        out.close()
      }

    } else {
      log.info(
        "No X509 certificate from server, download the certificate and install it at the DP keystore")
    }

  }

}

sealed case class CsTrustManager(dtm: X509TrustManager)
    extends X509TrustManager {

  private lazy val log = Logger(classOf[CsTrustManager])

  private val c = new AtomicReference[Array[X509Certificate]]()

  def chain = c.get()

  override def checkServerTrusted(x509Certificates: Array[X509Certificate],
                                  auth: String): Unit = {
    c.set(x509Certificates)

    Try(dtm.checkServerTrusted(x509Certificates, auth)) match {
      case Success(_) => log.info("Trusted certificate!!")
      case Failure(_) => log.info(s"Certificate is not trusted $x509Certificates")
    }
  }

  override def checkClientTrusted(x509Certificates: Array[X509Certificate],
                                  s: String): Unit = ???

  override def getAcceptedIssuers: Array[X509Certificate] =
    Array[X509Certificate]()
}
