package internal

import java.util.Date

import io.jsonwebtoken.impl.crypto.MacProvider
import io.jsonwebtoken.{Jwts, SignatureAlgorithm}
import play.api.Logger
import play.api.libs.json.{JsError, JsSuccess, Json}

import scala.util.Try

import com.hortonworks.dataplane.commons.domain.Entities._
import com.hortonworks.dataplane.commons.domain.JsonFormatters._

object Jwt {

  val algorithm = SignatureAlgorithm.HS256
  val key = "0<((A018l#%j&94dZiW7$4Gh9Pq!|["
  val signingKey = MacProvider.generateKey()
  val issuer: String = "data_plane"
  val HOUR = 3600 * 1000


  def makeJWT(user: User): String = {
    val nowMillis = System.currentTimeMillis()
    val now = new Date(nowMillis)
    val claims = new java.util.HashMap[String, Object]()
    claims.put("user", Json.toJson(user).toString())

    val builder = Jwts.builder()
      .setIssuedAt(now)
      .setIssuer(issuer)
      .setClaims(claims)
      .setExpiration(new Date(now.getTime + 2 * HOUR))
      .signWith(algorithm, signingKey)
    builder.compact()

  }


  def parseJWT(jwt: String): Option[User] = {
    Logger.info("Parsing user authorization token")

    val claims = Try(Some(Jwts.parser()
      .setSigningKey(signingKey)
      .parseClaimsJws(jwt).getBody())) getOrElse None

    Logger.info(s"Checking if token claims are defined -  ${claims.isDefined}")

    claims.map { c =>
      val expiration: Date = c.getExpiration()
      if (expiration.before(new Date()))
        None
      val userJsonString = c.get("user").toString
      Json.parse(userJsonString).validate[User] match {
        case JsSuccess(user, _) => Some(user)
        case JsError(error) => None
      }
    } getOrElse None

  }


}
