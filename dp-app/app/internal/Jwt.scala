/*
 *
 *  * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *  *
 *  * Except as expressly permitted in a written agreement between you or your company
 *  * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 *  * reproduction, modification, redistribution, sharing, lending or other exploitation
 *  * of all or any part of the contents of this software is strictly prohibited.
 *
 */

package internal

import java.util.Date

import io.jsonwebtoken.impl.crypto.MacProvider
import io.jsonwebtoken.{Jwts, SignatureAlgorithm}
import play.api.Logger
import play.api.libs.json.{JsError, JsSuccess, Json}

import scala.util.Try
import com.hortonworks.dataplane.commons.domain.Entities._
import com.hortonworks.dataplane.commons.domain.JsonFormatters._
import org.apache.commons.codec.binary.Base64

object Jwt {

  val algorithm = SignatureAlgorithm.HS256
  val signingKey = "aPdSgVkYp3s6v9y$B&E)H@McQeThWmZq4t7w!z%C*F-JaNdRgUjXn2r5u8x/A?D("
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
      .signWith(algorithm, Base64.encodeBase64String(signingKey.getBytes()))
    builder.compact()

  }


  def parseJWT(jwt: String): Option[User] = {
    Logger.info("Parsing user authorization token")

    val claims = Try(Some(Jwts.parser()
      .setSigningKey(Base64.encodeBase64String(signingKey.getBytes()))
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
