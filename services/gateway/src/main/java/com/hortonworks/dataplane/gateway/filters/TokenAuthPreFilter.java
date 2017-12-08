/*
 * Copyright 2013-2015 the original author or authors.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package com.hortonworks.dataplane.gateway.filters;

import com.hortonworks.dataplane.gateway.auth.AuthenticationService;
import com.hortonworks.dataplane.gateway.domain.Constants;
import com.hortonworks.dataplane.gateway.domain.UserContext;
import com.hortonworks.dataplane.gateway.exceptions.GatewayException;
import com.hortonworks.dataplane.gateway.utils.CookieUtils;
import com.netflix.zuul.ZuulFilter;
import com.netflix.zuul.context.RequestContext;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import javax.servlet.http.HttpServletRequest;

import static org.springframework.cloud.netflix.zuul.filters.support.FilterConstants.PRE_DECORATION_FILTER_ORDER;
import static org.springframework.cloud.netflix.zuul.filters.support.FilterConstants.PRE_TYPE;


@Service
public class TokenAuthPreFilter extends ZuulFilter {

  @Autowired
  private AuthenticationService authenticationService;

  @Autowired
  private CookieUtils cookieUtils;

  @Override
  public String filterType() {
    return PRE_TYPE;
  }

  @Override
  public int filterOrder() {
    return PRE_DECORATION_FILTER_ORDER + 2;
  }

  @Override
  public boolean shouldFilter() {
    RequestContext context = RequestContext.getCurrentContext();
    HttpServletRequest request = context.getRequest();
    String authHeader = request.getHeader(Constants.AUTHORIZATION_HEADER);
    String authCookie = cookieUtils.getDataplaneToken();
    return context.get(Constants.USER_CTX_KEY) == null && ((authHeader != null && authHeader.startsWith(Constants.AUTH_HEADER_PRE_BEARER)) || authCookie != null);
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

    UserContext userContext = authenticationService.buildUserContextFromToken(token);
    context.set(Constants.USER_CTX_KEY, userContext);
    context.set(Constants.USER_DP_TOKEN, token);

    return null;
  }
}
