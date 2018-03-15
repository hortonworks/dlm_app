package com.hortonworks.dataplane.cs.tls

import javax.inject.Inject
import javax.net.ssl.SSLContext

import com.hortonworks.dataplane.db.Webservice.CertificateService
import com.typesafe.config.Config
import com.typesafe.sslconfig.ssl.{ConfigSSLContextBuilder, DefaultKeyManagerFactoryWrapper, DefaultTrustManagerFactoryWrapper, SSLConfigSettings, SSLLooseConfig, SimpleSSLContextBuilder}
import com.typesafe.sslconfig.util.NoopLogger

class LooseTrustManager @Inject()(val config: Config, val certificateService: CertificateService) {
  val tlsConfig = build

  private def build: SSLContext = {
    val loose =
      SSLLooseConfig()
        .withAcceptAnyCertificate(true)
        .withDisableHostnameVerification(true)

    val config =
      SSLConfigSettings()
          .withLoose(loose)

    val keyManagerFactory = new DefaultKeyManagerFactoryWrapper(config.keyManagerConfig.algorithm)
    val trustManagerFactory = new DefaultTrustManagerFactoryWrapper(config.trustManagerConfig.algorithm)
    new ConfigSSLContextBuilder(NoopLogger.factory(), config, keyManagerFactory, trustManagerFactory).build()
  }

  def get: SSLContext = tlsConfig

}