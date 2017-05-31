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
import io.jsonwebtoken.impl.crypto.MacProvider;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.security.Key;
import java.util.Date;
import java.util.Map;

@Component
public class Jwt {

  private static final Logger logger = LoggerFactory.getLogger(Jwt.class);

  private ObjectMapper objectMapper = new ObjectMapper();
  private static SignatureAlgorithm sa = SignatureAlgorithm.HS256;
  static String signingKey = "aPdSgVkYp3s6v9y$B&E)H@McQeThWmZq4t7w!z%C*F-JaNdRgUjXn2r5u8x/A?D(";
  private static String issuer = "data_plane";
  private static int MINUTE = 60 * 1000;
  private static String encodedSecretKey = Base64.encodeBase64String(signingKey.getBytes());
  private static String decoded = Base64.encodeBase64String(signingKey.getBytes());

  @Value("${jwt.validity.minutes}")
  private Long jwtValidity;
  private  Key signingkey = MacProvider.generateKey();

  public String makeJWT(User user) throws JsonProcessingException {
    long timeMillis = System.currentTimeMillis();
    Date now = new Date(timeMillis);
    Map<String, Object> claims = Maps.newHashMap();
    claims.put("user", objectMapper.writeValueAsString(user));

    JwtBuilder builder = Jwts.builder()
      .setIssuedAt(now)
      .setIssuer(issuer)
      .setClaims(claims)
      .setExpiration(new Date(now.getTime() + jwtValidity *MINUTE))
      .signWith(sa, encodedSecretKey);

    return builder.compact();

  }


  public Optional<User> parseJWT(String jwt) throws IOException {
    Claims claims = Jwts.parser()
      .setSigningKey(decoded)
      .parseClaimsJws(jwt).getBody();

    Date expiration = claims.getExpiration();
    if (expiration.before(new Date())) {
      logger.debug("Token expired: " + claims.get("user"));
      return Optional.absent();
    }

    String userJsonString = claims.get("user").toString();

    User user = objectMapper.readValue(userJsonString, User.class);
    return Optional.fromNullable(user);
  }

}
