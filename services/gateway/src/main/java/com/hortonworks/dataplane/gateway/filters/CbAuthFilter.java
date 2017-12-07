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

import com.google.common.net.InternetDomainName;
import com.hortonworks.dataplane.gateway.domain.CloudbreakContext;
import com.hortonworks.dataplane.gateway.domain.Constants;
import com.hortonworks.dataplane.gateway.domain.UserContext;
import com.hortonworks.dataplane.gateway.exceptions.GatewayException;
import com.hortonworks.dataplane.gateway.utils.Jwt;
import com.netflix.zuul.ZuulFilter;
import com.netflix.zuul.context.RequestContext;
import com.typesafe.config.Config;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import javax.servlet.http.HttpServletRequest;
import java.util.Optional;

import static com.hortonworks.dataplane.gateway.domain.Constants.CLOUDBREAK;
import static com.hortonworks.dataplane.gateway.utils.Conditions.*;
import static org.springframework.cloud.netflix.zuul.filters.support.FilterConstants.*;

//TODO: Ashwin - Add cloudbreak Headers before forward and handle redirections if any

@Service
public class CbAuthFilter extends ZuulFilter {

  public static final String DEFAULT_TLD = ".com";
  public static final String API_PATH = "/service/cloudbreak/cloudbreak";
  public static final String STATIC_ASSETS_SSI_BASE_HREF_TMPL_HTML = "/service/cloudbreak/static/assets/ssi/base-href.tmpl.html";
  private static Logger log = LoggerFactory.getLogger(CbAuthFilter.class);

  @Override
  public String filterType() {
    return PRE_TYPE;
  }

  @Override
  public int filterOrder() {
    return PRE_DECORATION_FILTER_ORDER + 10;
  }

  @Autowired
  private Config config;

  @Autowired
  private Jwt jwt;

  @Override
  public boolean shouldFilter() {
    RequestContext context = RequestContext.getCurrentContext();
    String serviceId = context.get(SERVICE_ID_KEY).toString();
    return serviceId.equals(CLOUDBREAK);
  }

  @Override
  public Object run() {
    RequestContext context = RequestContext.getCurrentContext();
    if (context.getRequest().getRequestURI().equals(STATIC_ASSETS_SSI_BASE_HREF_TMPL_HTML)) {
      // write the required template in the response
      context.setResponseBody("<base href='/cloudbreak/'>");
    } else {
      UserContext userContext = (UserContext) context.get(Constants.USER_CTX_KEY);
      // Get the forwarded header
      Optional<String> host = Optional.ofNullable(context.getRequest().getHeader("X-Forwarded-Host"));
      ifNull(userContext).throwError(new GatewayException(HttpStatus.FORBIDDEN, "User does not have access to " + CLOUDBREAK));
      ifFalse(host.isPresent()).throwError(new GatewayException(HttpStatus.INTERNAL_SERVER_ERROR, "No host header to be forwarded"));
      CloudbreakContext cloudbreakContext = CloudbreakContext.from(userContext);
      // Create an email from domain and username
      String email = cloudbreakContext.getUsername() + "@" + host.get();
      cloudbreakContext.setSecret(config.getString("dp.gateway.services.cloudbreak.key"));
      cloudbreakContext.setEmail(email);
      cloudbreakContext.setDomain(host.get());
      String jwt = this.jwt.makeJWT(cloudbreakContext);
      log.info("Sending cloudbreak request to " + context.getRequest().getRequestURI());
      if (!context.getRequest().getRequestURI().startsWith(API_PATH)) {
        context.addZuulRequestHeader(Constants.AUTHORIZATION_HEADER, "Bearer " + jwt);
      }
    }
    return null;
  }


}
