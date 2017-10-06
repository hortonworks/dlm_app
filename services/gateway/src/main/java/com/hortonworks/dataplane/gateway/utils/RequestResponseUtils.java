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

import com.hortonworks.dataplane.gateway.domain.Constants;
import com.netflix.zuul.context.RequestContext;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

@Component
public class RequestResponseUtils {
  @Autowired
  private KnoxSso knoxSso;

  @Autowired
  private HostUtils hostUtils;

  public void addNoCacheHeaders(HttpServletResponse response) {
    response.addHeader("Cache-Control","no-cache, no-store, max-age=0, must-revalidate");
    response.addHeader("Pragma","no-cache");
    response.addHeader("Expires","0");
  }

  private void redirectTo(String path) {
    RequestContext ctx = RequestContext.getCurrentContext();
    try {
      addNoCacheHeaders(ctx.getResponse());
      ctx.getResponse().sendRedirect(path);
      ctx.setSendZuulResponse(false);
      ctx.set(Constants.RESPONSE_COMMITTED,true);
    } catch (IOException e) {
      throw new RuntimeException(e);
    }
  }

  private String getRootPath() {
    if (hostUtils.isRequestFromProxy()) {
      return appRootUrl();
    } else {
      return "/";
    }
  }

  public void redirectToRoot() {
    redirectTo(getRootPath());
  }

  public void redirectToLogin() {
    redirectTo(getLoginUrl());
  }
  public void redirectToForbidden() {
    redirectTo(getRootPath() + "unauthorized");
  }

  public String getLoginUrl() {
    return getRootPath() + "login";
  }

  public void redirectToServiceError(){
    redirectTo(getRootPath() + "service-notenabled");
  }

  public void redirectToKnoxLogin() {
    RequestContext ctx = RequestContext.getCurrentContext();
    String redirectTo = ctx.getRequest().getParameter("landingUrl");
    if (redirectTo == null) {
      redirectTo = appRootUrl();
    }
    redirectTo(knoxSso.getLoginUrl(redirectTo));
  }

  private String appRootUrl() {
    String proto=hostUtils.getRequestProtocol();
    return String.format("%s://%s%s/",proto, hostUtils.getRequestHost(),hostUtils.getRequestPort());
  }

  public void redirectToLocalSignin() {
    if (hostUtils.isRequestFromProxy()) {
      redirectTo(getRootPath() + Constants.LOCAL_SIGNIN_PATH);
    } else {
      redirectTo(Constants.LOCAL_SIGNIN_PATH);
    }
  }

  public String getDomainFromRequest() {
    return hostUtils.getRequestHost();
  }

  public boolean isLoginPath() {
    return RequestContext.getCurrentContext().getRequest().getServletPath().equals(Constants.LOGIN_ENTRY_POINT);
  }
}