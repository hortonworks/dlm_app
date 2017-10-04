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
import org.springframework.stereotype.Component;

import java.net.URI;
import java.net.URISyntaxException;

@Component
public class HostUtils {
  public String getRequestHost() {
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
  public boolean isRequestFromProxy() {
    //currently check ngnix.
    RequestContext ctx = RequestContext.getCurrentContext();
    String realHost = ctx.getRequest().getHeader("X-Forwarded-Host");
    return realHost != null;
  }
  public String getRequestPort(){
    RequestContext ctx = RequestContext.getCurrentContext();
    if (isRequestFromProxy()){
      String forwardedPort=ctx.getRequest().getHeader("X-Forwarded-Port");
      if (forwardedPort==null || forwardedPort.equals("80")){
        return "";
      }else{
        return ":"+forwardedPort;
      }
    }else{
      int serverPort = ctx.getRequest().getServerPort();
      return ":"+String.valueOf(serverPort==80?"":serverPort);
    }
  }

  public String getRequestProtocol(){
    RequestContext ctx = RequestContext.getCurrentContext();
    if (isRequestFromProxy()){
      String forwardedProto=ctx.getRequest().getHeader("X-Forwarded-Proto");
      return forwardedProto;
    }else{
      String proto= ctx.getRequest().getScheme();
      return proto;
    }
  }

}
