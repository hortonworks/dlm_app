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
package com.hortonworks.dataplane.gateway.filters;


import com.hortonworks.dataplane.gateway.domain.*;
import com.hortonworks.dataplane.gateway.exceptions.GatewayException;
import com.hortonworks.dataplane.gateway.service.BlacklistedTokenService;
import com.hortonworks.dataplane.gateway.utils.*;
import com.netflix.zuul.ZuulFilter;
import com.netflix.zuul.context.RequestContext;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import javax.servlet.http.HttpServletRequest;

import static org.springframework.cloud.netflix.zuul.filters.support.FilterConstants.*;

@Service
public class TokenInvalidationCheckPreFilter extends ZuulFilter {
  private static final Logger logger = LoggerFactory.getLogger(TokenInvalidationCheckPreFilter.class);

  @Autowired
  private BlacklistedTokenService tokenService;

  @Autowired
  private CookieUtils cookieUtils;

  @Override
  public String filterType() {
    return PRE_TYPE;
  }


  @Override
  public int filterOrder() {
    return PRE_DECORATION_FILTER_ORDER + 3;
  }


  @Override
  public boolean shouldFilter() {
    RequestContext context = RequestContext.getCurrentContext();
    HttpServletRequest request = context.getRequest();
    String authHeader = request.getHeader(Constants.AUTHORIZATION_HEADER);
    String authCookie = cookieUtils.getDataplaneToken();
    return context.get(Constants.USER_CTX_KEY) != null && ((authHeader != null && authHeader.startsWith(Constants.AUTH_HEADER_PRE_BEARER)) || authCookie != null);
  }

  @Override
  public Object run() {

    RequestContext context = RequestContext.getCurrentContext();
    HttpServletRequest request = context.getRequest();
    String authHeader = request.getHeader(Constants.AUTHORIZATION_HEADER);
    String authCookie = cookieUtils.getDataplaneToken();
    String token = null;
    if(authHeader != null && authHeader.startsWith(Constants.AUTH_HEADER_PRE_BEARER)) {
      token = authHeader.substring(Constants.AUTH_HEADER_PRE_BEARER.length());
    } else if(authCookie != null) {
      token = authCookie;
    }

    if(token == null) {
      throw new GatewayException(HttpStatus.BAD_REQUEST, "Unable to find token.");
    }

    UserContext userContext = (UserContext) context.get(Constants.USER_CTX_KEY);

    if(userContext == null) {
      throw new GatewayException(HttpStatus.INTERNAL_SERVER_ERROR, "User context could not be found.");
    }

    if(userContext.isDbManaged() && tokenService.isBlacklisted(token)) {
      throw new GatewayException(HttpStatus.UNAUTHORIZED, "This token has been marked as invalid.");
    }

   return null;
  }


}
