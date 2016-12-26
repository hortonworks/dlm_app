package internal

import java.util.Date
import javax.crypto.spec.SecretKeySpec
import javax.xml.bind.DatatypeConverter

import io.jsonwebtoken.impl.crypto.MacProvider
import io.jsonwebtoken.{Jwts, SignatureAlgorithm}
import models.{User, UserView}
import play.api.Logger

import scala.util.Try


object Jwt {

  val algorithm = SignatureAlgorithm.HS256
  val key = "0<((A018l#%j&94dZiW7$4Gh9Pq!|["
  val signingKey = "hello" //MacProvider.generateKey()
  val issuer: String = "data_plane"
  val HOUR = 3600 * 1000

  def makeJWT(user: UserView): String = {

    val nowMillis = System.currentTimeMillis()
    val now = new Date(nowMillis)
    val claims = new java.util.HashMap[String, Object]()

    val builder = Jwts.builder().setId(user.username)
      .setIssuedAt(now)
      .setSubject(user.username)
      .setIssuer(issuer)
      .setSubject(if(user.admin) "admin" else "user")
      .setExpiration(new Date(now.getTime + 2 * HOUR))
      .signWith(algorithm, signingKey)
    builder.compact()

  }


  def parseJWT(jwt: String): Option[UserView] = {
    Logger.info("Parsing user authorization token")

    val claims = Try(Some(Jwts.parser()
      .setSigningKey(signingKey)
      .parseClaimsJws(jwt).getBody())) getOrElse None

    Logger.info(s"Checking if token claims are defined -  ${claims.isDefined}")

    claims.map { c =>
      val expiration: Date = c.getExpiration()
//      if (expiration.before(new Date()))
//        None
      val userName = c.getId
      val admin = c.getSubject == "admin"
      Some(UserView(userName, "", admin))
    } getOrElse None

  }


}
