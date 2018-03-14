package com.hortonworks.dataplane.cs.tls

import javax.inject.Inject

import com.hortonworks.dataplane.db.Webservice.CertificateService
import com.typesafe.config.Config
import com.typesafe.sslconfig.ssl.{SSLConfigSettings, TrustManagerConfig, TrustStoreConfig}

import scala.concurrent.duration.Duration
import scala.concurrent.{Await, Future}
import scala.util.Try
import scala.concurrent.ExecutionContext.Implicits.global

class TrustManager @Inject()(val config: Config, val certificateService: CertificateService) {
  val system = TrustStoreConfig(data=None, filePath = Some("${java.home}/lib/security/cacerts"))

  val timeout = Duration(Try(config.getString("dp.certificate.query.timeout")).getOrElse("30 seconds)"))

  var tlsConfig = Await.result(build, timeout)

  private def build: Future[SSLConfigSettings] = {
    certificateService.list(active = Some(true))
      .map { certificates =>

        val trusts =
          certificates
            .map(cCertificate => TrustStoreConfig(Some(cCertificate.data), None).withStoreType(cCertificate.format))

        val trustManagerConfig =
          TrustManagerConfig()
            .withTrustStoreConfigs((trusts :+ system).toList)

        SSLConfigSettings()
          .withTrustManagerConfig(trustManagerConfig)
      }
  }

  def get: SSLConfigSettings = tlsConfig

  def reload: SSLConfigSettings = {
    tlsConfig = Await.result(build, timeout)
    tlsConfig
  }

}