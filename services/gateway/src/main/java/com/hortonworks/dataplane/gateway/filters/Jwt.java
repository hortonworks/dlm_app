package com.hortonworks.dataplane.gateway.filters;


import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.common.base.Optional;
import com.google.common.collect.Maps;
import com.hortonworks.dataplane.gateway.domain.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtBuilder;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import org.apache.commons.codec.binary.Base64;

import java.io.IOException;
import java.util.Date;
import java.util.Map;

public class Jwt {

  static ObjectMapper objectMapper = new ObjectMapper();
  static SignatureAlgorithm sa = SignatureAlgorithm.HS256;
  static String signingKey = "aPdSgVkYp3s6v9y$B&E)H@McQeThWmZq4t7w!z%C*F-JaNdRgUjXn2r5u8x/A?D(";
  static String issuer = "data_plane";
  static int HOUR = 3600 * 1000;
  private static String encodedSecretKey = Base64.encodeBase64String(signingKey.getBytes());
  private static String decoded = Base64.encodeBase64String(signingKey.getBytes());

  public static String makeJWT(User user) throws JsonProcessingException {
    long timeMillis = System.currentTimeMillis();
    Date now = new Date(timeMillis);
    Map<String, Object> claims = Maps.newHashMap();
    claims.put("user", objectMapper.writeValueAsString(user));

    JwtBuilder builder = Jwts.builder()
      .setIssuedAt(now)
      .setIssuer(issuer)
      .setClaims(claims)
      .setExpiration(new Date(now.getTime() + 2 * HOUR))
      .signWith(sa, encodedSecretKey);

    return builder.compact();

  }


  public static Optional<User> parseJWT(String jwt) throws IOException {
    Claims claims = Jwts.parser()
      .setSigningKey(decoded)
      .parseClaimsJws(jwt).getBody();

    Date expiration = claims.getExpiration();
    if (expiration.before(new Date()))
      Optional.absent();
    String userJsonString = claims.get("user").toString();

    User user = objectMapper.readValue(userJsonString, User.class);
    return Optional.fromNullable(user);
  }

}
