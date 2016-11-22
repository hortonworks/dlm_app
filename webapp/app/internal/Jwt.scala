package internal

import java.util.Date
import javax.crypto.spec.SecretKeySpec
import javax.xml.bind.DatatypeConverter

import io.jsonwebtoken.{Jwts, SignatureAlgorithm}
import models.{User, UserView}

object Jwt {

  val algorithm = SignatureAlgorithm.HS256
  val key = "0<((A018l#%j&94dZiW7$4Gh9Pq!|["
  val apiKeySecretBytes = DatatypeConverter.parseBase64Binary(key)
  val signingKey = new SecretKeySpec(apiKeySecretBytes, algorithm.getJcaName())
  val issuer: String = "data_plane"
  val HOUR = 3600*1000

  def makeJWT(user:UserView):String = {

    val nowMillis = System.currentTimeMillis()
    val now = new Date(nowMillis)
    val claims = new java.util.HashMap[String,Object]()
    if(user.admin)
      claims.put("admin","true")
    val builder = Jwts.builder().setId(user.username)
      .setIssuedAt(now)
      .setSubject(user.username)
      .setIssuer(issuer)
      .setExpiration(new Date(now.getTime + 2 * HOUR))
      .signWith(algorithm, signingKey)
      .setClaims(claims)

    builder.compact()

  }

}
