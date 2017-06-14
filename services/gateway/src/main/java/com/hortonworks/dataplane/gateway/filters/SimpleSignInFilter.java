package com.hortonworks.dataplane.gateway.filters;


import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.common.base.Optional;
import com.hortonworks.dataplane.gateway.domain.*;
import com.hortonworks.dataplane.gateway.domain.Error;
import com.hortonworks.dataplane.gateway.service.UserService;
import com.hortonworks.dataplane.gateway.utils.Utils;
import com.netflix.zuul.ZuulFilter;
import com.netflix.zuul.context.RequestContext;
import feign.FeignException;
import org.mindrot.jbcrypt.BCrypt;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;


import javax.servlet.ServletInputStream;

import java.io.IOException;

import static org.springframework.cloud.netflix.zuul.filters.support.FilterConstants.PRE_DECORATION_FILTER_ORDER;
import static org.springframework.cloud.netflix.zuul.filters.support.FilterConstants.PRE_TYPE;
import static org.springframework.cloud.netflix.zuul.filters.support.FilterConstants.SERVICE_ID_KEY;

@Service
public class SimpleSignInFilter extends ZuulFilter {

  private static final String AUTH_ENTRY_POINT = Constants.DPAPP_BASE_PATH+"/auth/in";

  @Autowired
  private UserService userService;

  @Autowired
  private Jwt jwt;

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
      Optional<User> user = userService.getUser(credential.getUsername());
      if (!user.isPresent()){
        return sendNoUserResponse();
      }

      boolean validPassword = BCrypt.checkpw(credential.getPassword(), user.get().getPassword());
      if (!validPassword) {
        return sendInvalidPasswordResponse();
      }
      Optional<UserRef> userRefOpt = userService.getUserRef(credential.getUsername());
      if (userRefOpt.isPresent()){
        // Construct a JWT token
        UserRef userRef=userRefOpt.get();
        String token = jwt.makeJWT(userRef);
        userRef.setToken(token);
        ctx.setResponseStatusCode(200);
        ctx.setResponseBody(objectMapper.writeValueAsString(userRef));
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
