package internal

import java.io.ByteArrayInputStream

import scala.io.Source
import java.security.cert.CertificateFactory
import java.security.cert.Certificate
import java.security.PublicKey

import io.jsonwebtoken.{ExpiredJwtException, Jwts}
import java.nio.file.{Files, Paths}
import java.util.Date

import com.google.inject.Inject
import play.api.Configuration
import play.api.Logger

class KnoxSso @Inject()(configuration: Configuration) {
  private val DP_APP_HOME: String = configuration.underlying.getString("DP_APP_HOME")
  private val publicKeyPath = configuration.underlying.getString("signing.pub.key.path")
  private val signingKey: Option[PublicKey] = getSigningPublicKey
  private val ssoCookieName: String = configuration.underlying.getString("sso.cookie.name")
  private val knoxUrl: String = configuration.underlying.getString("knox.url")
  private val knoxWebssoPath: String = configuration.underlying.getString("knox.websso.path")

  def isSsoConfigured(): Boolean = {
    //TODO store this in db or elsewhere . user can setup sso or disable at will.
    return !DP_APP_HOME.isEmpty && Files.exists(Paths.get(pubFilePath))
  }

  def getSsoCookieName(): String = ssoCookieName

  def getLoginUrl(appRedirectUrl: String): String = s"${knoxUrl}${knoxWebssoPath}?originalUrl=${appRedirectUrl}"

  def validateJwt(serializedJWT: String): Either[Exception, (String, Long)] = {
    if (signingKey.isDefined) {
      try {
        val parsed = Jwts.parser().setSigningKey(signingKey.get).parseClaimsJws(serializedJWT)
        val expiration: Date = parsed.getBody.getExpiration
        Right((parsed.getBody.getSubject), if (expiration != null) expiration.getTime else -1)
      } catch {
        case e: ExpiredJwtException =>
          Left(new Exception("token-expired"))
      }
    } else {
      Logger.info("sso signig key not found")
      Left(new Exception("sso-not-configured"))
    }
  }

  private def pubFilePath: String = s"${publicKeyPath}"

  private def getSigningPublicKey(): Option[PublicKey] = {
    try {
      val source: Source = Source.fromFile(publicKeyPath)
      val certificateString: String = source.mkString
      val fact: CertificateFactory = CertificateFactory.getInstance("X.509")
      val is: ByteArrayInputStream = new ByteArrayInputStream(certificateString.getBytes("UTF8"))
      val cer: Certificate = fact.generateCertificate(is)
      Some(cer.getPublicKey)
    } catch {
      case e: Exception => {
        None
      }
    }
  }

}
