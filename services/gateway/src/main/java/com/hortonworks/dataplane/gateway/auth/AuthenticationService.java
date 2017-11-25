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
package com.hortonworks.dataplane.gateway.auth;

import com.google.common.base.Optional;
import com.hortonworks.dataplane.gateway.domain.Credential;
import com.hortonworks.dataplane.gateway.domain.UserContext;
import com.hortonworks.dataplane.gateway.exceptions.GatewayException;
import com.hortonworks.dataplane.gateway.service.UserService;
import com.hortonworks.dataplane.gateway.utils.Jwt;
import feign.FeignException;
import org.mindrot.jbcrypt.BCrypt;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;


@Component
public class AuthenticationService {

  private static Logger logger = LoggerFactory.getLogger(AuthenticationService.class);

  @Autowired
  private UserService userService;

  @Autowired
  private Jwt jwt;

  public UserContext buildUserContextFromToken(String token) throws GatewayException {
    UserContext userContext = jwt.parseJWT(token);

    if (!userContext.isActive()) {
      throw new GatewayException(HttpStatus.FORBIDDEN, "User has been disabled.");
    }

    return userContext;
  }

  public UserContext buildUserContextFromCredential(Credential credential)
    throws GatewayException {

    try {
      UserContext userContext = getUserContextFromCredential(credential);

      return userContext;
    } catch (FeignException ex) {
      throw new GatewayException(HttpStatus.SERVICE_UNAVAILABLE, "Unable to fetch user from database.");
    }
  }

  public UserContext getUserContextFromCredential(Credential credential)
    throws GatewayException {

    Optional<UserContext> userContextFromDb = userService.getUserContext(credential.getUsername());
    if (!userContextFromDb.isPresent()){
      throw new GatewayException(HttpStatus.UNAUTHORIZED, "User does not exist");
    }

    UserContext userContext= userContextFromDb.get();
    userContext.setDbManaged(true);
    if (!userContext.isActive()){
      throw new GatewayException(HttpStatus.FORBIDDEN, "User has been disabled.");
    }

    boolean validPassword = false;
    try {
      validPassword = BCrypt.checkpw(credential.getPassword(), userContext.getPassword());
    } catch (Exception ex) {
      throw new GatewayException(HttpStatus.UNAUTHORIZED, "Password match failed.");
    }
    if (!validPassword) {
      throw new GatewayException(HttpStatus.UNAUTHORIZED, "Password match failed.");
    }

    userContext.setPassword("");

    return userContext;
  }

}
