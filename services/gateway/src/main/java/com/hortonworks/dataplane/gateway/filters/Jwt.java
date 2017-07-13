package com.hortonworks.dataplane.gateway.filters;


import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.common.base.Optional;
import com.google.common.collect.Maps;
import com.hortonworks.dataplane.gateway.domain.User;
import com.hortonworks.dataplane.gateway.domain.UserRef;
import com.hortonworks.dataplane.gateway.utils.GatewayKeystore;
import io.jsonwebtoken.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import java.io.IOException;
import java.security.Key;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Map;

@Component
public class Jwt {
  private static final Logger logger = LoggerFactory.getLogger(Jwt.class);
  public static final String USER_CLAIM = "user";
  public static final String ROLES_CLAIM="roles";

  private ObjectMapper objectMapper = new ObjectMapper();
  private static SignatureAlgorithm sa = SignatureAlgorithm.RS256;
  private static String issuer = "data_plane";

  private static int MINUTE = 60 * 1000;

  @Value("${jwt.validity.minutes}")
  private Long jwtValidity;

  @Autowired
  private GatewayKeystore gatewayKeystore;

  public String makeJWT(UserRef userRef) throws JsonProcessingException {
    long timeMillis = System.currentTimeMillis();
    Date now = new Date(timeMillis);
    Map<String, Object> claims = Maps.newHashMap();
    claims.put(USER_CLAIM, objectMapper.writeValueAsString(userRef));

    JwtBuilder builder = Jwts.builder()
      .setIssuedAt(now)
      .setIssuer(issuer)
      .setSubject(userRef.getUsername())
      .setClaims(claims)
      .setExpiration(new Date(now.getTime() + jwtValidity *MINUTE))
      .signWith(sa, getSigningKey());

    return builder.compact();

  }


  public Optional<UserRef> parseJWT(String jwt) throws IOException {
    try {
      Claims claims = Jwts.parser()
        .setSigningKey(getVerifyingKey())
        .parseClaimsJws(jwt).getBody();
      Date expiration = claims.getExpiration();
      if (expiration.before(new Date())) {
        logger.debug("Token expired: " + claims.get("user"));
        return Optional.absent();
      }else{
        String userJsonString = claims.get(USER_CLAIM).toString();
        UserRef userRef = objectMapper.readValue(userJsonString, UserRef.class);
        return Optional.fromNullable(userRef);
      }
    }catch (ExpiredJwtException ex){
      logger.error("token expired",ex);
      return Optional.absent();
    }
  }

  private Key getSigningKey() {
    return gatewayKeystore.getPrivate();
  }
  private Key getVerifyingKey() {
    return gatewayKeystore.getPublic();
  }

}
