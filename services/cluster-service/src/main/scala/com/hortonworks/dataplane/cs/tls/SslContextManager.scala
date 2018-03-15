package com.hortonworks.dataplane.cs.tls

import javax.inject.Inject
import javax.net.ssl.SSLContext

import akka.actor.ActorSystem
import akka.http.scaladsl.{Http, HttpsConnectionContext}
import akka.stream.Materializer
import com.hortonworks.dataplane.commons.domain.Entities.{DataplaneCluster, WrappedErrorException}
import com.hortonworks.dataplane.db.Webservice.{CertificateService, DpClusterService}
import com.typesafe.config.Config
import com.typesafe.sslconfig.akka.AkkaSSLConfig
import com.typesafe.sslconfig.ssl.{ConfigSSLContextBuilder, DefaultKeyManagerFactoryWrapper, DefaultTrustManagerFactoryWrapper, SSLConfigSettings, SSLLooseConfig, TrustManagerConfig, TrustStoreConfig}
import com.typesafe.sslconfig.util.NoopLogger
import io.netty.handler.ssl.{ClientAuth, JdkSslContext}
import org.asynchttpclient.DefaultAsyncHttpClientConfig
import play.api.libs.ws.ahc.{AhcWSClient, AhcWSClientConfig}
import play.api.libs.ws.ssl.{KeyManagerConfig, KeyStoreConfig, SSLConfig}
import play.api.libs.ws.{WSClient, WSClientConfig}

import scala.concurrent.{Await, Future}
import scala.concurrent.duration.Duration
import scala.concurrent.ExecutionContext.Implicits.global
import scala.util.Try

class SslContextManager @Inject()(val config: Config, val dpClusterService: DpClusterService, certificateService: CertificateService, val materializer: Materializer, val actorSystem: ActorSystem) {
  implicit val actorSystemImplicit = actorSystem

  val timeout = Duration(Try(config.getString("dp.certificate.query.timeout")).getOrElse("30 seconds)"))

  val home = System.getProperty("java.home")
  val system = TrustStoreConfig(data=None, filePath = Some(s"$home/lib/security/cacerts"))

  private val loose = buildLoose()
  private var strict = Await.result(buildStrict(), timeout)

  private val looseHttpsContext = Http().createClientHttpsContext(AkkaSSLConfig().withSettings(loose))
  private var strictHttpsContext = Http().createClientHttpsContext(AkkaSSLConfig().withSettings(strict))

  private val looseWsClient = buildWSClient(allowUntrusted = true)
  private var strictWsClient = buildWSClient(allowUntrusted = false)


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

  private def getDataplaneCluster(dpClusterId: Option[String], clusterId: Option[String] = None): Future[DataplaneCluster] = {
    dpClusterService.retrieve(dpClusterId.get)
      .map {
        case Left(errors) => throw WrappedErrorException(errors.errors.head)
        case Right(dpCluster) => dpCluster
      }
  }

  private def getContext(allowUntrusted: Boolean): SSLContext = {
    allowUntrusted match {
      case true => buildContext(loose)
      case false => buildContext(strict)
    }
  }

  private def buildWSClient(allowUntrusted: Boolean): WSClient = {
    implicit val materializerImplicit = materializer
    val context = new JdkSslContext(getContext(allowUntrusted=false), true, ClientAuth.NONE)
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

    SSLConfigSettings()
      .withLoose(loose)
      .withDisabledKeyAlgorithms(scala.collection.immutable.Seq("RSA keySize < 1024"))
  }

  private def buildStrict(): Future[SSLConfigSettings] = {
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

  private def buildContext(sslConfig: SSLConfigSettings): SSLContext = {
    val keyManagerFactory = new DefaultKeyManagerFactoryWrapper(sslConfig.keyManagerConfig.algorithm)
    val trustManagerFactory = new DefaultTrustManagerFactoryWrapper(sslConfig.trustManagerConfig.algorithm)
    new ConfigSSLContextBuilder(NoopLogger.factory(), sslConfig, keyManagerFactory, trustManagerFactory).build()
  }
}
