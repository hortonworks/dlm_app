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


import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.common.base.Optional;
import com.hortonworks.dataplane.gateway.domain.*;
import com.hortonworks.dataplane.gateway.domain.Error;
import com.hortonworks.dataplane.gateway.utils.Jwt;
import com.hortonworks.dataplane.gateway.service.UserService;
import com.hortonworks.dataplane.gateway.utils.CookieManager;
import com.hortonworks.dataplane.gateway.utils.Utils;
import com.netflix.zuul.ZuulFilter;
import com.netflix.zuul.context.RequestContext;
import feign.FeignException;
import org.mindrot.jbcrypt.BCrypt;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;


import javax.servlet.ServletInputStream;

import java.io.IOException;
import java.util.Date;

import static org.springframework.cloud.netflix.zuul.filters.support.FilterConstants.PRE_DECORATION_FILTER_ORDER;
import static org.springframework.cloud.netflix.zuul.filters.support.FilterConstants.PRE_TYPE;
import static org.springframework.cloud.netflix.zuul.filters.support.FilterConstants.SERVICE_ID_KEY;

@Service
public class SimpleSignInFilter extends ZuulFilter {
  private static final Logger logger = LoggerFactory.getLogger(SimpleSignInFilter.class);

  private static final String AUTH_ENTRY_POINT = Constants.DPAPP_BASE_PATH+"/auth/in";

  @Autowired
  private UserService userService;

  @Autowired
  private Jwt jwt;

  @Autowired
  private CookieManager cookieManager;

  @Autowired
  private Utils utils;

  private ObjectMapper objectMapper = new ObjectMapper();

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
    RequestContext ctx = RequestContext.getCurrentContext();
    String serviceId = ctx.get(SERVICE_ID_KEY).toString();
    // Check if its a sign in call
    return serviceId.equals(Constants.DPAPP) && ctx.getRequest().getServletPath().equals(AUTH_ENTRY_POINT);
  }


  @Override
  public Object run() {
    // Sign in call
    // get user and roles, and create token
    RequestContext ctx = RequestContext.getCurrentContext();
    try {
      ServletInputStream inputStream = ctx.getRequest().getInputStream();
      Credential credential = objectMapper.readValue(inputStream, Credential.class);
      Optional<UserContext> userContextFromDb = userService.getUserContext(credential.getUsername());
      if (!userContextFromDb.isPresent()){
        return sendNoUserResponse();
      }
      boolean validPassword = false;
      try {
        validPassword = BCrypt.checkpw(credential.getPassword(), userContextFromDb.get().getPassword());
      } catch (Exception ex) {
        logger.warn("Check password failed", ex);
      }
      if (!validPassword) {
        return sendInvalidPasswordResponse();
      }
      UserContext userContext= userContextFromDb.get();
      userContext.setDbManaged(true);
      if (!userContext.isActive()){
        return utils.sendForbidden(utils.getInactiveErrorMsg(userContext.getUsername()));
      }else {
        String jwtToken = jwt.makeJWT(userContext);
        userContext.setToken(jwtToken);
        ctx.setResponseStatusCode(200);
        ctx.setResponseBody(objectMapper.writeValueAsString(userContext));
        cookieManager.addDataplaneJwtCookie(jwtToken,Optional.<Date>absent());
        ctx.setSendZuulResponse(false);
      }
    } catch (IOException e) {
      ctx.setResponseStatusCode(500);
      ctx.setSendZuulResponse(false);
      throw new RuntimeException("Error decoding the credentials");
    } catch (FeignException fe) {
      return handleFeignError(ctx, fe);
    }
    return null;
  }

  private Object handleFeignError(RequestContext ctx, FeignException fe) {
    int status = fe.status();
    ctx.setResponseStatusCode(status == 404 ? 401 : status);
    try {
      ctx.setResponseBody(objectMapper.writeValueAsString(new Error("Cannot find user", fe.getMessage())));
      ctx.setSendZuulResponse(false);
      return null;
    } catch (JsonProcessingException e) {
      ctx.setResponseStatusCode(500);
      ctx.setSendZuulResponse(false);
      throw new RuntimeException("Error decoding the credential");
    }
  }

  private boolean sendInvalidPasswordResponse() throws JsonProcessingException {
    RequestContext ctx = RequestContext.getCurrentContext();
    ctx.setResponseStatusCode(401);
    ctx.setResponseBody(objectMapper.writeValueAsString(new Error("Incorrect password", "")));
    ctx.setSendZuulResponse(false);
    return true;

  }

  private boolean sendNoUserResponse() throws JsonProcessingException {
     RequestContext ctx = RequestContext.getCurrentContext();
     ctx.setResponseStatusCode(401);
     ctx.setResponseBody(objectMapper.writeValueAsString(new Error("Cannot find user", "")));
     ctx.setSendZuulResponse(false);
     return true;
  }
}
