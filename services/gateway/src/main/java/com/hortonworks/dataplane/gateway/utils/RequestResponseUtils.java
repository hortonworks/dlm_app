package com.hortonworks.dataplane.gateway.utils;

import com.hortonworks.dataplane.gateway.domain.Constants;
import com.netflix.zuul.context.RequestContext;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
public class RequestResponseUtils {
  @Autowired
  private KnoxSso knoxSso;

  @Autowired
  private HostUtils hostUtils;

  @Autowired
  private Utils utils;

  private void redirectTo(String path) {
    RequestContext ctx = RequestContext.getCurrentContext();
    try {
      utils.addNoCacheHeaders(ctx.getResponse());
      ctx.getResponse().sendRedirect(path);
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