package com.hortonworks.dataplane.gateway.filters;


import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.hortonworks.dataplane.gateway.domain.Credential;
import com.hortonworks.dataplane.gateway.domain.Error;
import com.hortonworks.dataplane.gateway.domain.User;
import com.hortonworks.dataplane.gateway.domain.UserList;
import com.hortonworks.dataplane.gateway.domain.UserRef;
import com.hortonworks.dataplane.gateway.domain.UserRoleResponse;
import com.netflix.zuul.ZuulFilter;
import com.netflix.zuul.context.RequestContext;
import feign.FeignException;
import org.mindrot.jbcrypt.BCrypt;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import javax.servlet.ServletInputStream;
import java.io.IOException;
import java.util.ArrayList;

import static org.springframework.cloud.netflix.zuul.filters.support.FilterConstants.*;

@Service
public class TokenCheckFilter extends ZuulFilter {

  public static final String AUTH_ENTRY_POINT = "/api/app/auth/in";
  public static final String DPAPP = "dpapp";
  @Autowired
  UserServiceInterface userServiceInterface;

  ObjectMapper objectMapper = new ObjectMapper();

  @Override
  public String filterType() {
    return PRE_TYPE;
  }


  @Override
  public int filterOrder() {
    return PRE_DECORATION_FILTER_ORDER + 3;
  }


  @Override
  public boolean shouldFilter() {
    RequestContext ctx = RequestContext.getCurrentContext();
    String serviceId = ctx.get(SERVICE_ID_KEY).toString();
    // Check if its not a sign in call - Protect everything else
    return serviceId.equals(DPAPP) && !ctx.getRequest().getServletPath().equals(AUTH_ENTRY_POINT);

  }


  @Override
  public Object run() {
    // Sign in call
    // get user and roles, and create token
    RequestContext ctx = RequestContext.getCurrentContext();

    return null;
  }


}
