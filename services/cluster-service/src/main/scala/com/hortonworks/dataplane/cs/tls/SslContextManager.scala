package com.hortonworks.dataplane.cs.tls

import javax.inject.Inject
import javax.net.ssl.SSLContext

import akka.http.scaladsl.{Http, HttpsConnectionContext}
import com.hortonworks.dataplane.db.Webservice.CertificateService
import com.typesafe.config.Config
import com.typesafe.sslconfig.akka.AkkaSSLConfig
import com.typesafe.sslconfig.ssl.{ConfigSSLContextBuilder, DefaultKeyManagerFactoryWrapper, DefaultTrustManagerFactoryWrapper, SSLConfigSettings, SSLLooseConfig, TrustManagerConfig, TrustStoreConfig}
import com.typesafe.sslconfig.util.NoopLogger
import io.netty.handler.ssl.JdkSslContext
import org.asynchttpclient.DefaultAsyncHttpClientConfig
import play.api.libs.ws.ahc.{AhcWSClient, AhcWSClientConfig}
import play.api.libs.ws.ssl.{KeyManagerConfig, KeyStoreConfig, SSLConfig}
import play.api.libs.ws.{WSClient, WSClientConfig}

import scala.concurrent.{Await, Future}
import scala.concurrent.duration.Duration
import scala.util.Try

class SslContextManager @Inject()(val config: Config, val certificateService: CertificateService) {

  val timeout = Duration(Try(config.getString("dp.certificate.query.timeout")).getOrElse("30 seconds)"))

  private val loose = buildLoose()
  private var strict = Await.result(buildStrict(), timeout)

  private val looseHttpsContext = Http().createClientHttpsContext(AkkaSSLConfig().withSettings(loose))
  private var strictHttpsContext = Http().createClientHttpsContext(AkkaSSLConfig().withSettings(strict))

  private val looseWsClient = buildWSClient(allowUntrusted = true)
  private var strictWsClient = buildWSClient(allowUntrusted = false)

  def getContext(allowUntrusted: Boolean): SSLContext = {
    allowUntrusted match {
      case true => buildContext(loose)
      case false => buildContext(strict)
    }
  }

  def getConfig(allowUntrusted: Boolean): SSLConfigSettings = {
    allowUntrusted match {
      case true => loose
      case false => strict
    }
  }

  def getHttpsConnectionContext(allowUntrusted: Boolean): HttpsConnectionContext = {
    allowUntrusted match {
      case true => looseHttpsContext
      case false => strictHttpsContext
    }
  }

  def getWSClient(allowUntrusted: Boolean): WSClient = {
    allowUntrusted match {
      case true => looseWsClient
      case false => strictWsClient
    }
  }

  def reload(): Unit = {
    strict = Await.result(buildStrict(), timeout)
    strictHttpsContext = Http().createClientHttpsContext(AkkaSSLConfig().withSettings(strict))
    strictWsClient = buildWSClient(allowUntrusted = false)
  }

  private def buildWSClient(allowUntrusted: Boolean): WSClient = {
    val context = new JdkSslContext(getContext(allowUntrusted=false), true, null)
    val clientConfig = new DefaultAsyncHttpClientConfig.Builder()
      .setSslContext(context)
      .build()
    AhcWSClient(clientConfig)
  }

  private def buildLoose(): SSLConfigSettings = {
    val disableHostnameVerification = Try(config.getBoolean("dp.services.ssl.config.disable.hostname.verification")).getOrElse(false)
    val loose =
      SSLLooseConfig()
        .withAcceptAnyCertificate(true)
        .withDisableHostnameVerification(disableHostnameVerification)

    val sslConfig =
      SSLConfigSettings()
        .withLoose(loose)
        .withDisabledKeyAlgorithms(scala.collection.immutable.Seq("RSA keySize < 1024"))
  }

  val system = TrustStoreConfig(data=None, filePath = Some("${java.home}/lib/security/cacerts"))

  private def buildStrict(): Future[SSLConfigSettings] = {
    certificateService.list(active = Some(true))
      .map { certificates =>

        val trusts =
          certificates
            .map(cCertificate => TrustStoreConfig(Some(cCertificate.data), None).withStoreType(cCertificate.format))

        val trustManagerConfig =
          TrustManagerConfig()
            .withTrustStoreConfigs((trusts :+ system).toList)

        val sslConfig =
          SSLConfigSettings()
            .withTrustManagerConfig(trustManagerConfig)
      }
  }

  private def buildContext(sslConfig: SSLConfigSettings): SSLContext = {
    val keyManagerFactory = new DefaultKeyManagerFactoryWrapper(sslConfig.keyManagerConfig.algorithm)
    val trustManagerFactory = new DefaultTrustManagerFactoryWrapper(sslConfig.trustManagerConfig.algorithm)
    new ConfigSSLContextBuilder(NoopLogger.factory(), sslConfig, keyManagerFactory, trustManagerFactory).build()
  }
}
