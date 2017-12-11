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

import com.hortonworks.dataplane.gateway.domain.Constants;
import com.hortonworks.dataplane.gateway.exceptions.GatewayException;
import com.netflix.zuul.ZuulFilter;
import com.netflix.zuul.context.RequestContext;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import static org.springframework.cloud.netflix.zuul.filters.support.FilterConstants.PRE_DECORATION_FILTER_ORDER;
import static org.springframework.cloud.netflix.zuul.filters.support.FilterConstants.PRE_TYPE;
import static org.springframework.cloud.netflix.zuul.filters.support.FilterConstants.SERVICE_ID_KEY;


@Service
public class AuthorizationPreFilter  extends ZuulFilter {

  @Override
  public String filterType() {
    return PRE_TYPE;
  }

  @Override
  public int filterOrder() {
    return PRE_DECORATION_FILTER_ORDER + 5;
  }

  @Override
  public boolean shouldFilter() {
    RequestContext context = RequestContext.getCurrentContext();
    if(context.get(Constants.USER_CTX_KEY) != null) {
      return false;
    }
    String serviceId = context.get(SERVICE_ID_KEY).toString();

    if (serviceId.equals(Constants.DPAPP) && context.getRequest().getServletPath().endsWith(Constants.KNOX_CONFIG_PATH)){
      // FIXME: possible security risk
      return false;
    }

    return serviceId.equals(Constants.DPAPP) || serviceId.equals(Constants.DLMAPP) || serviceId.equals(Constants.CLOUDBREAK);
  }

  @Override
  public Object run() {
    throw new GatewayException(HttpStatus.UNAUTHORIZED, "User is not authenticated.");
  }
}
