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


import com.google.common.base.Optional;
import com.hortonworks.dataplane.gateway.domain.*;
import com.hortonworks.dataplane.gateway.service.BlacklistedTokenService;
import com.hortonworks.dataplane.gateway.utils.*;
import com.netflix.util.Pair;
import com.netflix.zuul.ZuulFilter;
import com.netflix.zuul.context.RequestContext;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cloud.netflix.zuul.filters.ProxyRequestHelper;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;

import static com.hortonworks.dataplane.gateway.domain.Constants.BEARER_TOKEN_IN_COOKIE;
import static org.springframework.cloud.netflix.zuul.filters.support.FilterConstants.*;

@Service
public class TokenInvalidationPostFilter extends ZuulFilter {
  private static final Logger logger = LoggerFactory.getLogger(TokenInvalidationPostFilter.class);

  @Autowired
  private Utils utils;

  @Autowired
  private CookieManager cookieManager;

  @Autowired
  private BlacklistedTokenService blacklistedTokenCheckService;


  @Override
  public String filterType() {
    return POST_TYPE;
  }


  @Override
  public int filterOrder() {
    return PRE_DECORATION_FILTER_ORDER + 4;
  }


  @Override
  public boolean shouldFilter() {
    RequestContext ctx = RequestContext.getCurrentContext();
    String serviceId = ctx.get(SERVICE_ID_KEY).toString();
    // Check if it is a change password call
    return serviceId.equals(Constants.DPAPP) && ctx.getRequest().getServletPath().endsWith(Constants.CHANGE_PASSWORD_ROUTE);
  }

  @Override
  public Object run() {
    RequestContext context = RequestContext.getCurrentContext();
    Optional<String> bearerToken = BEARER_TOKEN_IN_COOKIE ? cookieManager.getDataplaneJwtCookie() : utils.getBearerTokenFromHeader();
    boolean isInvalidationRequired =
      context.getOriginResponseHeaders()
        .stream()
        .filter(header -> header.first().equalsIgnoreCase("X-Invalidate-Token"))
        .findAny()
        .orElse(new Pair<String, String>("X-Invalidate-Token", "false"))
        .second()
        .equalsIgnoreCase("true");
    if(bearerToken.isPresent() && isInvalidationRequired) {
      blacklistedTokenCheckService.insert(bearerToken.get(), LocalDateTime.now().plus(1, ChronoUnit.HOURS));
    }
    utils.removeResposeHeader("X-Invalidate-Token");
    return null;
  }

}
