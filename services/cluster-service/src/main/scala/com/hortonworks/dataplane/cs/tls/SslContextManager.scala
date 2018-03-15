package com.hortonworks.dataplane.cs.tls

import javax.inject.Inject
import javax.net.ssl.SSLContext

import com.hortonworks.dataplane.db.Webservice.CertificateService
import com.typesafe.config.Config
import com.typesafe.sslconfig.ssl.{ConfigSSLContextBuilder, DefaultKeyManagerFactoryWrapper, DefaultTrustManagerFactoryWrapper, SSLConfigSettings, SSLLooseConfig, TrustManagerConfig, TrustStoreConfig}
import com.typesafe.sslconfig.util.NoopLogger

import scala.concurrent.{Await, Future}
import scala.concurrent.duration.Duration
import scala.util.Try

class SslContextManager @Inject()(val config: Config, val certificateService: CertificateService) {

  val timeout = Duration(Try(config.getString("dp.certificate.query.timeout")).getOrElse("30 seconds)"))

  private val loose = buildLoose()
  private var strict = Await.result(buildStrict(), timeout)

  def get(allowUntrusted: Boolean): SSLContext = {
    allowUntrusted match {
      case true => loose
      case false => strict
    }
  }

  def reload():Unit = {
    strict = Await.result(buildStrict(), timeout)
  }

  private def buildLoose(): SSLContext = {
    val loose =
      SSLLooseConfig()
        .withAcceptAnyCertificate(true)
        .withDisableHostnameVerification(true)

    val sslConfig =
      SSLConfigSettings()
        .withLoose(loose)

    buildContext(sslConfig)
  }

  val system = TrustStoreConfig(data=None, filePath = Some("${java.home}/lib/security/cacerts"))

  private def buildStrict(): Future[SSLContext] = {
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

        buildContext(sslConfig)
      }
  }

  private def buildContext(sslConfig: SSLConfigSettings): SSLContext = {
    val keyManagerFactory = new DefaultKeyManagerFactoryWrapper(sslConfig.keyManagerConfig.algorithm)
    val trustManagerFactory = new DefaultTrustManagerFactoryWrapper(sslConfig.trustManagerConfig.algorithm)
    new ConfigSSLContextBuilder(NoopLogger.factory(), sslConfig, keyManagerFactory, trustManagerFactory).build()
  }
}
