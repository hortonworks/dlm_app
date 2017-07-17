package com.hortonworks.dataplane.gateway.utils;

import com.hortonworks.dataplane.gateway.domain.Constants;
import com.netflix.zuul.context.RequestContext;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.net.URI;
import java.net.URISyntaxException;

@Component
public class RequestResponseUtils {
  @Autowired
  private KnoxSso knoxSso;

  private void redirectTo(String path) {
    RequestContext ctx = RequestContext.getCurrentContext();
    try {
      ctx.getResponse().sendRedirect(path);
    } catch (IOException e) {
      throw new RuntimeException(e);
    }
  }

  private String getRootPath() {
    if (isRequestFromProxy()) {
      return String.format("http://%s/", getRequestHost());
    } else {
      return "/";
    }
  }

  private boolean isRequestFromProxy() {
    //currently check ngnix.
    RequestContext ctx = RequestContext.getCurrentContext();
    String realHost = ctx.getRequest().getHeader("X-Forwarded-Host");
    return realHost != null;
  }
  private String getRequestPort(){
    RequestContext ctx = RequestContext.getCurrentContext();
    int serverPort = ctx.getRequest().getServerPort();
    return ":"+String.valueOf(serverPort==80?"":serverPort);
  }
  private String getRequestHost() {
    RequestContext ctx = RequestContext.getCurrentContext();
    String realHost = ctx.getRequest().getHeader("X-Forwarded-Host");
    if (realHost != null) {
      return realHost;
    } else {
      String requestURLStr = ctx.getRequest().getRequestURL().toString();
      try {
        URI uri = new URI(requestURLStr);
        return uri.getHost();
      } catch (URISyntaxException e) {
        throw new RuntimeException(e);
      }
    }
  }

  public void redirectToRoot() {
    redirectTo(getRootPath());
  }

  public void redirectToLogin() {
    redirectTo(getRootPath() + "login");
  }

  public void redirectToKnoxLogin() {
    RequestContext ctx = RequestContext.getCurrentContext();
    String redirectTo = ctx.getRequest().getParameter("landingUrl");
    if (redirectTo == null) {
      redirectTo = String.format("http://%s%s", getRequestHost(),getRequestPort());
    }
    redirectTo(knoxSso.getLoginUrl(redirectTo));
  }

  public void redirectToLocalSignin() {
    if (isRequestFromProxy()) {
      redirectTo(getRootPath() + Constants.LOCAL_SIGNIN_PATH);
    } else {
      redirectTo(Constants.LOCAL_SIGNIN_PATH);
    }
  }

  public String getDomainFromRequest() {
    return this.getRequestHost();
  }

  public boolean isLoginPath() {
    return RequestContext.getCurrentContext().getRequest().getServletPath().equals(Constants.LOGIN_ENTRY_POINT);
  }
}