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
import com.hortonworks.dataplane.gateway.service.BlacklistedTokenService;
import com.hortonworks.dataplane.gateway.utils.*;
import com.netflix.util.Pair;
import com.netflix.zuul.ZuulFilter;
import com.netflix.zuul.context.RequestContext;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import javax.servlet.http.HttpServletRequest;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;

import static com.hortonworks.dataplane.gateway.domain.Constants.DP_INVALIDATION_HEADER_KEY;
import static org.springframework.cloud.netflix.zuul.filters.support.FilterConstants.*;

@Service
public class TokenInvalidationPostFilter extends ZuulFilter {
  private static final Logger logger = LoggerFactory.getLogger(TokenInvalidationPostFilter.class);

  @Autowired
  private CookieUtils cookieUtils;

  @Autowired
  private BlacklistedTokenService blacklistedTokenCheckService;

  @Override
  public String filterType() {
    return POST_TYPE;
  }


  @Override
  public int filterOrder() {
    return PRE_DECORATION_FILTER_ORDER + 7;
  }


  @Override
  public boolean shouldFilter() {
    RequestContext context = RequestContext.getCurrentContext();
    String serviceId = context.get(SERVICE_ID_KEY).toString();
    // Check if it is a change password call
    return context.getOriginResponseHeaders()
      .stream()
      .filter(header -> header.first().equalsIgnoreCase(DP_INVALIDATION_HEADER_KEY))
      .findAny()
      .orElse(new Pair<>(DP_INVALIDATION_HEADER_KEY, "false"))
      .second()
      .equalsIgnoreCase(Boolean.TRUE.toString());
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

    if(token != null) {
      blacklistedTokenCheckService.insert(token, LocalDateTime.now().plus(1, ChronoUnit.HOURS));
    }

    return null;
  }

}
