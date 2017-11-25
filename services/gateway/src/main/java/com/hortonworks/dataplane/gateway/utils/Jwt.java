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
package com.hortonworks.dataplane.gateway.utils;


import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.common.collect.Maps;
import com.hortonworks.dataplane.gateway.domain.UserContext;
import com.hortonworks.dataplane.gateway.exceptions.GatewayException;
import com.hortonworks.dataplane.gateway.service.ConfigurationService;
import io.jsonwebtoken.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.security.Key;
import java.util.Date;
import java.util.Map;

@Component
public class Jwt {
  private static final Logger logger = LoggerFactory.getLogger(Jwt.class);
  public static final String USER_CLAIM = "user";

  private ObjectMapper objectMapper = new ObjectMapper();
  private static SignatureAlgorithm sa = SignatureAlgorithm.RS256;
  private static String issuer = "data_plane";

  private static int MINUTE = 60 * 1000;

  @Autowired
  private ConfigurationService configurationService;

  @Autowired
  private GatewayKeystore gatewayKeystore;

  public String makeJWT(UserContext userContext) throws GatewayException {
    long timeMillis = System.currentTimeMillis();
    Date now = new Date(timeMillis);
    Map<String, Object> claims = Maps.newHashMap();
    try {
      claims.put(USER_CLAIM, objectMapper.writeValueAsString(userContext));
    } catch (JsonProcessingException ex) {
      throw new GatewayException(ex, HttpStatus.INTERNAL_SERVER_ERROR, "Unable to serialize user context.");
    }

    Long jwtValidity = this.configurationService.getJwtTokenValidity();
    JwtBuilder builder = Jwts.builder()
      .setIssuedAt(now)
      .setIssuer(issuer)
      .setSubject(userContext.getUsername())
      .setClaims(claims)
      .setExpiration(new Date(now.getTime() + jwtValidity * MINUTE))
      .signWith(sa, getSigningKey());

    return builder.compact();

  }

  private Claims parseAndGetClaims(String jwt)
      throws GatewayException {
    try {
      Claims claims = Jwts.parser()
        .setSigningKey(getVerifyingKey())
        .parseClaimsJws(jwt)
        .getBody();

      // Date expiration = claims.getExpiration();
      // if (expiration.before(new Date())) {
      //   logger.debug("Token expired: " + claims.get("user"));
      //   throw gateway exception
      // }

      return claims;

    } catch (ExpiredJwtException ex) {
      logger.error("token expired", ex);
      throw new GatewayException(HttpStatus.UNAUTHORIZED, "Token has expired.");
    } catch (JwtException e) {
      logger.error("Jwt Exception", e);
      throw new GatewayException(HttpStatus.UNAUTHORIZED, "Token was invalid.");
    }
  }

  public UserContext parseJWT(String jwt)
    throws GatewayException {

    try {
      Claims claims = parseAndGetClaims(jwt);

      String userJsonString = claims.get(USER_CLAIM).toString();
      UserContext userContext = objectMapper.readValue(userJsonString, UserContext.class);

      return userContext;

    } catch (IOException e) {
      logger.error("Exception", e);
      throw new GatewayException(HttpStatus.UNAUTHORIZED, "Token was invalid.");
    }
  }

  public Date getExpiration(String jwt)
    throws GatewayException {

    Claims claims = parseAndGetClaims(jwt);
    return claims.getExpiration();
  }

  private Key getSigningKey() {
    return gatewayKeystore.getPrivate();
  }

  private Key getVerifyingKey() {
    return gatewayKeystore.getPublic();
  }

}
