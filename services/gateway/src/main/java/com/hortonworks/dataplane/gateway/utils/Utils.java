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
package com.hortonworks.dataplane.gateway.utils;

import com.google.common.base.Optional;
import com.hortonworks.dataplane.gateway.domain.Constants;
import com.netflix.zuul.context.RequestContext;
import org.apache.commons.io.IOUtils;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cloud.netflix.zuul.filters.ProxyRequestHelper;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

import java.io.IOException;
import java.io.InputStream;
import java.io.StringWriter;
import java.util.HashMap;

import static org.springframework.cloud.netflix.zuul.filters.support.FilterConstants.SERVICE_ID_KEY;

@Component
public class Utils {
  private static final int BEARER_TOK_LEN = "Bearer ".length();
  private static final String BEARER_TOKEN_KEY = "Bearer ";
  private HashMap<String,String> loginRedirectCache=new HashMap<>();
  @Autowired
  private ProxyRequestHelper proxyRequestHelper;

  @Value("${useragent_engines}")
  private String userAgentEngines;

  @Autowired
  private RequestResponseUtils requestResponseUtils;

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
    if (isRequestFromBrower() && !isAjax()){
      requestResponseUtils.redirectToLogin();
      return null;
    }else{
      RequestContext ctx = RequestContext.getCurrentContext();
      ctx.setResponseStatusCode(HttpStatus.UNAUTHORIZED.value());
      if (message!=null){
        ctx.setResponseBody(message);
      }
      ctx.setSendZuulResponse(false);
      return null;
    }
  }

  public Object sendForbidden(String message) {
    if (isRequestFromBrower() && !isAjax()){
      //TODO redirect to forbidden page
      requestResponseUtils.redirectToForbidden();
      return null;
    }else {
      RequestContext ctx = RequestContext.getCurrentContext();
      ctx.setResponseStatusCode(HttpStatus.FORBIDDEN.value());
      if (message!=null){
        ctx.setResponseBody(message);
      }
      ctx.setSendZuulResponse(false);
      return null;
    }
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
  public String getLoginRedirectPage(String url){
    String html=loginRedirectCache.computeIfAbsent(url,urlInp-> getLoginRedirectHtml(urlInp));
    return html;
  }

  private String getLoginRedirectHtml(String url) {
    String template=getLoginRedirectTemplate();
    return template.replace("${url}",url);
  }

  private String getLoginRedirectTemplate() {
    InputStream resourceAsStream = this.getClass().getClassLoader().getResourceAsStream("logoutredirect.tmpl");
    StringWriter writer = new StringWriter();
    try {
      IOUtils.copy(resourceAsStream, writer);
      return writer.toString();
    } catch (IOException e) {
      throw new RuntimeException(e);
    }
  }

  public void addNoCacheHeaders(HttpServletResponse response) {
    requestResponseUtils.addNoCacheHeaders(response);
  }
  private boolean isRequestFromBrower(){
    HttpServletRequest request = RequestContext.getCurrentContext().getRequest();
    String ua=request.getHeader(HttpHeaders.USER_AGENT).substring(0,8);
    String[] userAgentsArr=userAgentEngines.split(",");
    for(String userAgent:userAgentsArr){
      if (ua.startsWith(userAgent)){
        return true;
      }
    }
    return false;
  }
  private boolean isAjax(){
    HttpServletRequest request = RequestContext.getCurrentContext().getRequest();
    String requestedWith = request.getHeader(Constants.HTTP_X_REQUESTED_WITH);
    return requestedWith !=null && requestedWith.toLowerCase().equals(Constants.XMLHttpRequestStringLowerCase);
  }
}
