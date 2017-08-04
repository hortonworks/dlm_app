package com.hortonworks.dataplane.gateway.utils;

import com.google.common.base.Optional;
import com.hortonworks.dataplane.gateway.domain.Constants;
import com.netflix.zuul.context.RequestContext;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cloud.netflix.zuul.filters.ProxyRequestHelper;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;

import javax.servlet.http.HttpServletRequest;

import static org.springframework.cloud.netflix.zuul.filters.support.FilterConstants.SERVICE_ID_KEY;

@Component
public class Utils {
  private static final int BEARER_TOK_LEN = "Bearer ".length();
  private static final String BEARER_TOKEN_KEY = "Bearer ";
  @Autowired
  private ProxyRequestHelper proxyRequestHelper;

  public Optional<String> getBearerTokenFromHeader() {
    HttpServletRequest request = RequestContext.getCurrentContext().getRequest();
    String AuthHeader = request.getHeader(Constants.AUTHORIZATION_HEADER);
    if (StringUtils.isNotBlank(AuthHeader) && AuthHeader.startsWith(BEARER_TOKEN_KEY)) {
      String token = request.getHeader("Authorization").substring(BEARER_TOK_LEN);
      return Optional.of(token);
    }
    return Optional.absent();
  }

  public void deleteAuthorizationHeaderToUpstream(){
    proxyRequestHelper.addIgnoredHeaders(Constants.AUTHORIZATION_HEADER);
  }

  public Object sendUnauthorized() {
    return sendUnauthorized(null);
  }
  public Object sendUnauthorized(String message) {
    RequestContext ctx = RequestContext.getCurrentContext();
    ctx.setResponseStatusCode(HttpStatus.UNAUTHORIZED.value());
    if (message!=null){
      ctx.setResponseBody(message);
    }
    ctx.setSendZuulResponse(false);
    return null;
  }

  public Object sendForbidden(String message) {
    RequestContext ctx = RequestContext.getCurrentContext();
    ctx.setResponseStatusCode(HttpStatus.FORBIDDEN.value());
    if (message!=null){
      ctx.setResponseBody(message);
    }
    ctx.setSendZuulResponse(false);
    return null;
  }


  public String getServiceId(){
    RequestContext ctx = RequestContext.getCurrentContext();
    return  ctx.get(SERVICE_ID_KEY).toString();
  }
  public boolean serlvetPathMatches(String path){
    RequestContext ctx = RequestContext.getCurrentContext();
    return ctx.getRequest().getServletPath().equals(path);
  }
  public String getInactiveErrorMsg(String subject){
    return String.format("{\"code\": \"USER_INACTIVATED\", \"message\":  User %s is marked inactive}",subject);
  }
  public String getUserNotFoundErrorMsg(String subject){
    return String.format("{\"code\": \"USER_NOT_FOUND\", \"message\":  User %s not found in the system}",subject);
  }
  public String getGroupNotFoundErrorMsg(String subject){
    return String.format("{\"code\": \"USER_NOT_FOUND\", \"message\":  User %s not found in the system.Group not configured.}",subject);
  }
}
