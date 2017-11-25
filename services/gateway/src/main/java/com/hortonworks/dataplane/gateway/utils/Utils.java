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
import com.hortonworks.dataplane.gateway.exceptions.GatewayException;
import com.hortonworks.dataplane.gateway.service.ConfigurationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;

import javax.servlet.http.HttpServletRequest;
import java.net.URI;
import java.net.URISyntaxException;


@Component
public class Utils {

  @Autowired
  private ConfigurationService configurationService;

  @Value("${knox.route}")
  String knoxRoute;

  @Value("${knox.websso.path}")
  private String knoxWebssoPath;

  public String getSignInUri() {
    if (configurationService.isLdapConfigured()){
      return this.knoxRoute + this.knoxWebssoPath;
    } else {
      return Constants.LOCAL_SIGNIN_PATH;
    }
  }

  public String getRequestHost(HttpServletRequest request) {
    String realHost = request.getHeader("X-Forwarded-Host");
    if (realHost != null) {
      return realHost;
    } else {
      String requestURLStr = request.getRequestURL().toString();
      try {
        URI uri = new URI(requestURLStr);
        return uri.getHost();
      } catch (URISyntaxException e) {
        throw new GatewayException(HttpStatus.INTERNAL_SERVER_ERROR, "Request URI is not valid.");
      }
    }
  }

}
