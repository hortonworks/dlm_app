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

package com.hortonworks.dataplane.gateway.monitor;

import com.hortonworks.dataplane.gateway.domain.Constants;
import com.hortonworks.dataplane.gateway.domain.ServiceStatus;
import com.hortonworks.dataplane.gateway.exceptions.GatewayException;
import com.hortonworks.dataplane.gateway.service.ServiceHealthInterface;
import com.hortonworks.dataplane.gateway.utils.CookieUtils;
import com.netflix.zuul.context.RequestContext;
import feign.Client;
import feign.Feign;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cloud.client.ServiceInstance;
import org.springframework.cloud.client.discovery.DiscoveryClient;
import org.springframework.cloud.netflix.feign.FeignClientsConfiguration;
import org.springframework.cloud.netflix.feign.support.ResponseEntityDecoder;
import org.springframework.cloud.netflix.feign.support.SpringEncoder;
import org.springframework.context.annotation.Import;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import java.util.List;

@RestController
@RequestMapping("/health")
@Import(FeignClientsConfiguration.class)
public class ServiceHealthController {

  @Autowired
  private DiscoveryClient discoveryClient;

  @Autowired
  private CookieUtils cookieUtils;

  private ServiceHealthInterface serviceHealthInterface;

  private ResponseEntityDecoder decoder;
  private SpringEncoder encoder;
  private Client client;

  private static Logger logger = LoggerFactory.getLogger(ServiceHealthController.class);

  @Autowired
  public ServiceHealthController(
    ResponseEntityDecoder decoder, SpringEncoder encoder, Client client) {
    this.encoder = encoder;
    this.decoder = decoder;
    this.client = client;
  }

  @RequestMapping("/{serviceId}")
  public ServiceStatus getServiceStatus(@PathVariable("serviceId") String serviceId, HttpServletRequest request){
    if(!isAuthenticated(request.getCookies())){
      throw new GatewayException(HttpStatus.UNAUTHORIZED, "User is not authenticated.");
    }
    ServiceStatus serviceStatus = new ServiceStatus();
    List<ServiceInstance> serviceInstanceList = discoveryClient.getInstances(serviceId);
    if(serviceInstanceList.isEmpty()){
      serviceStatus.setInstalled(false);
    }else{
      serviceStatus.setInstalled(true);
      serviceStatus.setHealthy(isHealthy(serviceId));
    }
    return serviceStatus;
  }

  private boolean isHealthy(String serviceId){
    this.serviceHealthInterface = Feign.builder().client(this.client)
      .encoder(this.encoder)
      .decoder(this.decoder)
      .target(ServiceHealthInterface.class, "http://"+serviceId);
    try {
      ResponseEntity<Void> response = serviceHealthInterface.getHealth();
      return response.getStatusCode() == HttpStatus.OK;
    }catch(RuntimeException e){
      logger.error(e.getMessage(), e);
      return false;
    }
  }

  private boolean isAuthenticated(Cookie[] cookies){
    boolean authenticated = false;
    if (cookies != null) {
      for (Cookie cookie : cookies) {
        if(cookieUtils.isRelevant(cookie.getName())) {
          authenticated = true;
          break;
        }
      }
    }
    return authenticated;
  }

}
