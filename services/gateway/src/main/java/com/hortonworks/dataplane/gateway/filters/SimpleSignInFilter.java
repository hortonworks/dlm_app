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

import static org.springframework.cloud.netflix.zuul.filters.support.FilterConstants.PRE_DECORATION_FILTER_ORDER;
import static org.springframework.cloud.netflix.zuul.filters.support.FilterConstants.PRE_TYPE;
import static org.springframework.cloud.netflix.zuul.filters.support.FilterConstants.SERVICE_ID_KEY;

@Service
public class SimpleSignInFilter extends ZuulFilter {

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
    return PRE_DECORATION_FILTER_ORDER + 2;
  }


  @Override
  public boolean shouldFilter() {
    RequestContext ctx = RequestContext.getCurrentContext();
    String serviceId = ctx.get(SERVICE_ID_KEY).toString();
    // Check if its a sign in call
    return serviceId.equals(DPAPP) && ctx.getRequest().getServletPath().equals(AUTH_ENTRY_POINT);
  }


  @Override
  public Object run() {
    // Sign in call
    // get user and roles, and create token
    RequestContext ctx = RequestContext.getCurrentContext();
    try {
      ServletInputStream inputStream = ctx.getRequest().getInputStream();
      Credential credential = objectMapper.readValue(inputStream, Credential.class);
      UserList user = userServiceInterface.getUser(credential.getUsername());
      if (hasNoUser(ctx, user)) return null;

      // Get the user
      User toSignIn = user.getResults().get(0);
      boolean checkpw = BCrypt.checkpw(credential.getPassword(), toSignIn.getPassword());
      if (passwordCheck(ctx, checkpw)) return null;

      // Construct a JWT token
      String token = Jwt.makeJWT(toSignIn);
      UserRef userRef = getUserRef(credential, toSignIn, token);

      ctx.setResponseStatusCode(200);
      ctx.setResponseBody(objectMapper.writeValueAsString(userRef));
      ctx.setSendZuulResponse(false);
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

  private boolean passwordCheck(RequestContext ctx, boolean checkpw) throws JsonProcessingException {
    if (!checkpw) {
      ctx.setResponseStatusCode(401);
      ctx.setResponseBody(objectMapper.writeValueAsString(new Error("Incorrect password", "")));
      ctx.setSendZuulResponse(false);
      return true;
    }
    return false;
  }

  private boolean hasNoUser(RequestContext ctx, UserList user) throws JsonProcessingException {
    if (user.getResults().size() == 0) {
      ctx.setResponseStatusCode(401);
      ctx.setResponseBody(objectMapper.writeValueAsString(new Error("Cannot find user", "")));
      ctx.setSendZuulResponse(false);
      return true;
    }
    return false;
  }

  private UserRef getUserRef(Credential credential, User toSignIn, String token) {
    UserRef userRef = new UserRef();
    userRef.setId(toSignIn.getUsername());
    userRef.setAvatar(toSignIn.getAvatar());
    userRef.setDisplay(toSignIn.getDisplayname());
    try {
      UserRoleResponse roles = userServiceInterface.getRoles(credential.getUsername());
      userRef.setRoles(roles.getResults().getRoles());
    } catch (Throwable th) {
      userRef.setRoles(new ArrayList<String>());
    }
    userRef.setToken(token);
    return userRef;
  }
}
