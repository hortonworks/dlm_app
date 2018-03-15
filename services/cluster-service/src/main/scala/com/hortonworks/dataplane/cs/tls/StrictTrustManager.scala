package com.hortonworks.dataplane.cs.tls

import javax.inject.Inject
import javax.net.ssl.SSLContext

import com.hortonworks.dataplane.db.Webservice.CertificateService
import com.typesafe.config.Config
import com.typesafe.sslconfig.ssl.{ConfigSSLContextBuilder, DefaultKeyManagerFactoryWrapper, DefaultTrustManagerFactoryWrapper, SSLConfigSettings, TrustManagerConfig, TrustStoreConfig}
import com.typesafe.sslconfig.util.NoopLogger

import scala.concurrent.duration.Duration
import scala.concurrent.{Await, Future}
import scala.util.Try
import scala.concurrent.ExecutionContext.Implicits.global

class StrictTrustManager @Inject()(val config: Config, val certificateService: CertificateService) {
  val system = TrustStoreConfig(data=None, filePath = Some("${java.home}/lib/security/cacerts"))

  val timeout = Duration(Try(config.getString("dp.certificate.query.timeout")).getOrElse("30 seconds)"))

  var tlsConfig = Await.result(build, timeout)

  private def build: Future[SSLContext] = {
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



        val keyManagerFactory = new DefaultKeyManagerFactoryWrapper(sslConfig.keyManagerConfig.algorithm)
        val trustManagerFactory = new DefaultTrustManagerFactoryWrapper(sslConfig.trustManagerConfig.algorithm)
        new ConfigSSLContextBuilder(NoopLogger.factory(), sslConfig, keyManagerFactory, trustManagerFactory).build()
      }
  }

  def get: SSLContext = tlsConfig

  def reload: SSLContext = {
    tlsConfig = Await.result(build, timeout)
    tlsConfig
  }

}
