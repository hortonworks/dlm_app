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


import com.hortonworks.dataplane.gateway.domain.Constants;
import com.hortonworks.dataplane.gateway.domain.TokenInfo;
import com.hortonworks.dataplane.gateway.domain.UserContext;
import com.hortonworks.dataplane.gateway.exceptions.GatewayException;
import com.hortonworks.dataplane.gateway.utils.CookieUtils;
import com.hortonworks.dataplane.gateway.utils.KnoxSso;
import com.netflix.zuul.ZuulFilter;
import com.netflix.zuul.context.RequestContext;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import static org.springframework.cloud.netflix.zuul.filters.support.FilterConstants.PRE_DECORATION_FILTER_ORDER;
import static org.springframework.cloud.netflix.zuul.filters.support.FilterConstants.PRE_TYPE;

@Service
public class KnoxEnsureAuthPreFilter extends ZuulFilter {
  private static final Logger logger = LoggerFactory.getLogger(KnoxEnsureAuthPreFilter.class);

  @Autowired
  private KnoxSso knox;

  @Autowired
  private CookieUtils cookieUtils;

  @Override
  public String filterType() {
    return PRE_TYPE;
  }


  @Override
  public int filterOrder() {
    return PRE_DECORATION_FILTER_ORDER + 4;
  }


  @Override
  public boolean shouldFilter() {
    RequestContext context = RequestContext.getCurrentContext();
    UserContext user = (UserContext) context.get(Constants.USER_CTX_KEY);
    return user != null && !user.isDbManaged();
  }

  @Override
  public Object run() {

    RequestContext context = RequestContext.getCurrentContext();
    String token = cookieUtils.getKnoxToken();
    TokenInfo tokenInfo = knox.validateJwt(token);

    if (!tokenInfo.isValid()) {
      context.set(Constants.USER_CTX_KEY, null);
      throw new GatewayException(HttpStatus.UNAUTHORIZED, "Knox token is invalid.");
    }

    return null;
  }


}
