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

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.hortonworks.dataplane.gateway.domain.Constants;
import com.hortonworks.dataplane.gateway.domain.UserContext;
import com.hortonworks.dataplane.gateway.exceptions.GatewayException;
import com.hortonworks.dataplane.gateway.utils.CookieUtils;
import com.netflix.zuul.ZuulFilter;
import com.netflix.zuul.context.RequestContext;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cloud.netflix.zuul.filters.ProxyRequestHelper;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import javax.servlet.http.HttpServletResponse;
import java.util.Base64;

import static org.springframework.cloud.netflix.zuul.filters.support.FilterConstants.PRE_DECORATION_FILTER_ORDER;
import static org.springframework.cloud.netflix.zuul.filters.support.FilterConstants.PRE_TYPE;


@Service
public class ContextForwardingPreFilter extends ZuulFilter {

  @Autowired
  private ProxyRequestHelper proxyRequestHelper;

  private ObjectMapper objectMapper = new ObjectMapper();

  @Override
  public String filterType() {
    return PRE_TYPE;
  }

  @Autowired
  private CookieUtils cookieUtils;

  @Override
  public int filterOrder() {
    return PRE_DECORATION_FILTER_ORDER + 6;
  }

  @Override
  public boolean shouldFilter() {
    RequestContext context = RequestContext.getCurrentContext();

    return context.get(Constants.USER_CTX_KEY) != null;
  }

  @Override
  public Object run() {
    RequestContext context = RequestContext.getCurrentContext();
    HttpServletResponse response = context.getResponse();

    try {
      UserContext userContext = (UserContext) context.get(Constants.USER_CTX_KEY);
      if(userContext != null) {
        String userJson = objectMapper.writeValueAsString(userContext);
        context.addZuulRequestHeader(Constants.DP_USER_INFO_HEADER_KEY, Base64.getEncoder().encodeToString(userJson.getBytes()));
      }

      String knoxToken = cookieUtils.getKnoxToken();
      if(knoxToken != null) {
        context.addZuulRequestHeader(Constants.DP_TOKEN_INFO_HEADER_KEY, knoxToken);
      }

      response.addHeader("Cache-Control","no-cache, no-store, max-age=0, must-revalidate");
      response.addHeader("Pragma","no-cache");
      response.addHeader("Expires","0");

      proxyRequestHelper.addIgnoredHeaders(Constants.AUTHORIZATION_HEADER);

    } catch (JsonProcessingException ex) {
      throw new GatewayException(HttpStatus.BAD_REQUEST, "Unable to serialize user context to JSON.");
    }
    return null;
  }
}
