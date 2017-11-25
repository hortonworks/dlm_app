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


import com.fasterxml.jackson.databind.ObjectMapper;
import com.hortonworks.dataplane.gateway.domain.Constants;
import com.hortonworks.dataplane.gateway.domain.UserContext;
import com.hortonworks.dataplane.gateway.utils.CookieUtils;
import com.hortonworks.dataplane.gateway.utils.Jwt;
import com.netflix.zuul.ZuulFilter;
import com.netflix.zuul.context.RequestContext;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import javax.servlet.http.Cookie;

import static org.springframework.cloud.netflix.zuul.filters.support.FilterConstants.*;

@Service
public class SetCookiePostFilter extends ZuulFilter {
  private static final Logger logger = LoggerFactory.getLogger(SetCookiePostFilter.class);

  @Autowired
  private Jwt jwt;

  @Autowired
  private CookieUtils cookieUtils;

  private ObjectMapper mapper = new ObjectMapper();


  @Override
  public String filterType() {
    return POST_TYPE;
  }


  @Override
  public int filterOrder() {
    return PRE_DECORATION_FILTER_ORDER + 8;
  }


  @Override
  public boolean shouldFilter() {
    RequestContext context = RequestContext.getCurrentContext();

    return context.get(Constants.USER_CTX_KEY) != null && context.get(Constants.USER_DP_TOKEN) == null;
  }

  @Override
  public Object run() {

    RequestContext context = RequestContext.getCurrentContext();
    UserContext userContext = (UserContext) context.get(Constants.USER_CTX_KEY);

    String token = jwt.makeJWT(userContext);

    Cookie cookie = cookieUtils.buildNewCookie(Constants.DP_JWT_COOKIE, token, jwt.getExpiration(token));
    context.getResponse().addCookie(cookie);

    return null;
  }

}
