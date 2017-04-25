package internal

import scala.io.Source
import java.security.cert.CertificateFactory
import java.security.cert.Certificate
import java.security.PublicKey

import io.jsonwebtoken.{ExpiredJwtException, Jwts}
import java.io.ByteArrayInputStream
import java.nio.file.{Files, Paths}
import java.util.Date

import com.google.inject.Inject
import play.api.Configuration


class KnoxSso @Inject()(configuration: Configuration) {
  private val DP_APP_HOME:String = configuration.underlying.getString("DP_APP_HOME")
  private val signingKey: PublicKey = getSigningPublicKey
  private val ssoCookieName:String = configuration.underlying.getString("sso.cookie.name")
  private val knoxUrl:String = configuration.underlying.getString("knox.url")
  private val knoxWebssoPath:String = configuration.underlying.getString("knox.websso.path")

  def isSsoConfigured(): Boolean = {
    //TODO store this in db or elsewhere . user can setup sso or disable at will.
    return !DP_APP_HOME.isEmpty && Files.exists(Paths.get(pubFilePath))
  }

  def getSsoCookieName(): String = ssoCookieName

  def getLoginUrl(appRedirectUrl: String): String = s"${knoxUrl}${knoxWebssoPath}?originalUrl=${appRedirectUrl}"

  def validateJwt(serializedJWT: String): Either[Exception, (String, Long)] = {
    try {
      val parsed = Jwts.parser().setSigningKey(signingKey).parseClaimsJws(serializedJWT)
      val expiration: Date = parsed.getBody.getExpiration
      Right((parsed.getBody.getSubject), if (expiration!=null)expiration.getTime else -1)
    } catch {
      case e: ExpiredJwtException =>
        Left(new Exception("token-expired"))
    }
  }

  private def pubFilePath: String = s"${DP_APP_HOME}/conf/cert/knox-signing.pem"

  private def getSigningPublicKey(): PublicKey = {
    val source = Source.fromFile(pubFilePath)
    val certificateString = try source.mkString finally source.close()
    val fact: CertificateFactory = CertificateFactory.getInstance("X.509")
    val is: ByteArrayInputStream = new ByteArrayInputStream(certificateString.getBytes("UTF8"))
    val cer: Certificate = fact.generateCertificate(is)
    cer.getPublicKey
  }

}
