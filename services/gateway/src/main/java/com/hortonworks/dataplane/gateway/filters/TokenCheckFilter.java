package com.hortonworks.dataplane.gateway.filters;


import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.common.base.Optional;
import com.hortonworks.dataplane.gateway.domain.User;
import com.hortonworks.dataplane.gateway.domain.UserList;
import com.netflix.zuul.ZuulFilter;
import com.netflix.zuul.context.RequestContext;
import io.jsonwebtoken.JwtException;
import org.apache.commons.lang3.StringUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import java.io.IOException;

import static org.springframework.cloud.netflix.zuul.filters.support.FilterConstants.*;

@Service
public class TokenCheckFilter extends ZuulFilter {
  private static final Logger logger = LoggerFactory.getLogger(TokenCheckFilter.class);
  public static final String AUTH_ENTRY_POINT = "/api/app/auth/in";
  public static final String DPAPP = "dpapp";
  public static final int BEARER_TOK_LEN = "Bearer ".length();
  public static final String AUTHORIZATION_HEADER = "Authorization";
  public static final String BEARER_TOKEN_KEY = "Bearer ";
  public static final String GATEWAY_TOKEN = "gateway-token";

  @Autowired
  UserServiceInterface userServiceInterface;

  @Autowired
  private KnoxSso knoxSso;


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
    Optional<String> bearerToken=getBearerToken();
    if (bearerToken.isPresent()){
      return authorizeThroughBearerToken(bearerToken);
    }else if (knoxSso.isSsoConfigured()){
      Optional<String> knoxSsoCookie = getKnoxSsoCookie();
      if (!knoxSsoCookie.isPresent()){
        return  redirectToLoginPage();
      }
      Optional<String> subjectOptional = knoxSso.validateJwt(knoxSsoCookie.get());
      if (!subjectOptional.isPresent()) {
        return redirectToLoginPage();
      }
      UserList userList = userServiceInterface.getUser(subjectOptional.get());
      if (userList==null || userList.getResults()==null || userList.getResults().size()<1){
        return  redirectToLoginPage();
      }
      setUpstreamUserContext(userList.getResults().get(0));
      return null;
    }else {  //TODO validate knox sso.
      return sendForbidden();
    }
  }

  private void setUpstreamUserContext(User user) {
    RequestContext ctx = RequestContext.getCurrentContext();
    try {
      ctx.addZuulRequestHeader(GATEWAY_TOKEN,Jwt.makeJWT(user));
    } catch (JsonProcessingException e) {
      throw new RuntimeException(e);
    }
  }

  private Object redirectToLoginPage() {
    RequestContext ctx = RequestContext.getCurrentContext();
    try {
      //TODO get app redirect URL.. how..
      ctx.getResponse().sendRedirect(knoxSso.getLoginUrl(""));
    } catch (IOException e) {
      logger.error("Exception",e);
    }
    return null;
  }


  private Optional<String> getKnoxSsoCookie(){
    RequestContext ctx = RequestContext.getCurrentContext();
    Cookie[] cookies = ctx.getRequest().getCookies();
    if (cookies!=null){
      for(Cookie cookie:cookies){
        if (cookie.getName().equals(knoxSso.getSsoCookieName())){
          return Optional.of(cookie.getValue());
        }
      }
    }
    return Optional.absent();
  }

  private Object authorizeThroughBearerToken(Optional<String> bearerToken) {
    try {
      Optional<User> userOptional = Jwt.parseJWT(bearerToken.get());
      if (!userOptional.isPresent()){
        return sendForbidden();
      }else{
        User user = userOptional.get();
        setUpstreamUserContext(user);
        return null;
        //TODO  role check. api permission check on the specified resource.
      }
    } catch(JwtException e){
      logger.error("Exception",e);
      return sendForbidden();
    }catch (IOException e) {
      logger.error("Exception",e);
      return sendUnautorized();
    }
  }

  private Object sendUnautorized() {
    RequestContext ctx = RequestContext.getCurrentContext();
    ctx.setResponseStatusCode(401);
    ctx.setSendZuulResponse(false);
    throw new RuntimeException("Request not allowed");
  }
  private Object sendForbidden() {
    RequestContext ctx = RequestContext.getCurrentContext();
    ctx.setResponseStatusCode(403);
    ctx.setSendZuulResponse(false);
    throw new RuntimeException("Request not allowed");
  }

  private Optional<String> getBearerToken() {
    HttpServletRequest request = RequestContext.getCurrentContext().getRequest();
    String AuthHeader = request.getHeader(AUTHORIZATION_HEADER);
    if (StringUtils.isNotBlank(AuthHeader) && AuthHeader.startsWith(BEARER_TOKEN_KEY)) {
      String token = request.getHeader("Authorization").substring(BEARER_TOK_LEN);
      return Optional.of(token);
    }
    return Optional.absent();
  }
}
