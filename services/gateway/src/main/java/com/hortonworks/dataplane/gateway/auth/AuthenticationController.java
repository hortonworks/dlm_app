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

import com.hortonworks.dataplane.gateway.domain.Constants;
import com.hortonworks.dataplane.gateway.domain.Credential;
import com.hortonworks.dataplane.gateway.domain.UserContext;
import com.hortonworks.dataplane.gateway.exceptions.GatewayException;
import com.hortonworks.dataplane.gateway.utils.CookieUtils;
import com.hortonworks.dataplane.gateway.utils.Jwt;
import com.hortonworks.dataplane.gateway.utils.Utils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.util.*;

@RestController
@RequestMapping("/auth")
public class AuthenticationController {

  private static Logger logger = LoggerFactory.getLogger(AuthenticationController.class);

  @Autowired
  private AuthenticationService authenticationService;

  @Autowired
  private CookieUtils cookieUtils;

  @Autowired
  private Jwt jwt;

  @Autowired
  private Utils utils;

  @RequestMapping(path="/in", method = RequestMethod.POST)
  public ResponseEntity<?> signIn(@RequestBody Credential credential, HttpServletResponse response) {

    try {
      UserContext userContext = authenticationService.getUserContextFromCredential(credential);

      String token = jwt.makeJWT(userContext);
      Cookie cookie = cookieUtils.buildNewCookie(Constants.DP_JWT_COOKIE, token, jwt.getExpiration(token));
      response.addCookie(cookie);

      return new ResponseEntity<Object>(userContext, HttpStatus.OK);
    } catch (GatewayException ex) {
      return new ResponseEntity<String>(ex.getStatus().getReasonPhrase(), ex.getStatus());
    }
  }

  @RequestMapping(path="/out", method = RequestMethod.GET)
  public Object signOut(HttpServletRequest request, HttpServletResponse response) {
    Cookie[] cookies = request.getCookies();
    if (cookies != null) {
      for (Cookie cookie : cookies) {
        if(cookieUtils.isRelevant(cookie.getName())) {
          Cookie clearCookie = cookieUtils.buildDeleteCookie(cookie, utils.getRequestHost(request));
          response.addCookie(clearCookie);
        }
      }
    }

    response.addHeader(Constants.AUTH_HEADER_CHALLENGE_ADDRESS, utils.getSignInUri());

    return new HashMap<String, String>();
  }

}
