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

import com.netflix.zuul.context.RequestContext;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.net.URI;
import java.net.URISyntaxException;

@Component
public class HostUtils {

  @Value("${dps.root.path}")
  private String dpsRootPath;

  public boolean isRequestFromProxy() {
    //currently check ngnix.
    RequestContext ctx = RequestContext.getCurrentContext();
    String realHost = ctx.getRequest().getHeader("X-Forwarded-Host");
    String dpRealHost = ctx.getRequest().getHeader("X-DP-Forwarded-Host");
    return (realHost != null || dpRealHost != null);
  }

  public String getRequestHost() {
    RequestContext ctx = RequestContext.getCurrentContext();
    String realHost = ctx.getRequest().getHeader("X-Forwarded-Host");
    String dpHost = ctx.getRequest().getHeader("X-DP-Forwarded-Host");
    if (realHost != null) {
      return realHost;
    } else if (dpHost != null) {
      return dpHost;
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

  public String getRequestProtocol(){
    RequestContext ctx = RequestContext.getCurrentContext();
    String forwardedProto=ctx.getRequest().getHeader("X-Forwarded-Proto");
    String dpForwardedProto = ctx.getRequest().getHeader("X-DP-Forwarded-Proto");
    if(forwardedProto != null) {
      return forwardedProto;
    } else if(dpForwardedProto != null) {
      return dpForwardedProto;
    } else{
      String proto= ctx.getRequest().getScheme();
      return proto;
    }
  }

  public String getAppRootUrl() {
    return String.format("%s://%s%s", getRequestProtocol(), getRequestHost(), dpsRootPath);
  }

  public String getRootPath() {
    if (isRequestFromProxy()) {
      return getAppRootUrl();
    } else {
      return this.dpsRootPath;
    }
  }

}
