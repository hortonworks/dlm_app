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

  private void redirectTo(String path){
    RequestContext ctx = RequestContext.getCurrentContext();
    try{
      ctx.getResponse().sendRedirect(path);
    } catch (IOException e) {
      throw new RuntimeException(e);
    }
  }

  private String getRootPath() {
    if (isRequestFromProxy()){
      return String.format("http://%s/",getRequestHost());
    }else{
      return "/";
    }
  }
  private boolean isRequestFromProxy(){
    //currently check ngnix.
    RequestContext ctx = RequestContext.getCurrentContext();
    String realHost= ctx.getRequest().getHeader("X-Forwarded-Host");
    return realHost!=null;
  }

  private String getRequestHost() {
    RequestContext ctx = RequestContext.getCurrentContext();
    String realHost= ctx.getRequest().getHeader("X-Forwarded-Host");
    if (realHost!=null){
      return realHost;
    }else{
      String requestURLStr = ctx.getRequest().getRequestURL().toString();
      try {
        URI uri = new URI(requestURLStr);
        return uri.getHost();
      } catch (URISyntaxException e) {
        throw new RuntimeException(e);
      }
    }
  }

  public void redirectToRoot(){
    redirectTo(getRootPath());
  }
  public void redirectToLogin(){
    redirectTo(getRootPath()+Constants.LOGIN_PATH);
  }

  public void redirectToKnoxLogin(String redirectTo) {
    redirectTo(knoxSso.getLoginUrl(redirectTo));
  }

  public void redirectToLocalSignin(){
    if (isRequestFromProxy()){
      redirectTo(getRootPath()+ Constants.LOCAL_SIGNIN_PATH);
    }else{
      redirectTo(Constants.LOCAL_SIGNIN_PATH);
    }
  }

  public String getDomainFromRequest()  {
    return this.getRequestHost();
  }
}