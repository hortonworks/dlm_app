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

package com.hortonworks.datapalane.consul;

import java.util.List;

public class DpService {

  private String serviceId;
  private String serviceName;
  private List<String> serviceTags;
  private String host;
  private Integer port;
  private Integer healthCheckIntervalInSecs = 5;
  private Integer deregisterServiceAfterInMinutes =10;

  public DpService(String serviceId,String serviceName,List<String> serviceTags, String host,Integer port) {
    this.serviceId = serviceId;
    this.serviceName = serviceName;
    this.serviceTags = serviceTags;
    this.host = host;
    this.port = port;
  }

  public String getServiceId() {
    return serviceId;
  }

  public List<String> getServiceTags() {
    return serviceTags;
  }

  public Integer getPort() {
    return port;
  }

  public Integer getDeregisterServiceAfterInMinutes() {
    return deregisterServiceAfterInMinutes;
  }

  public void setDeregisterServiceAfterInMinutes(Integer deregisterServiceAfterInMinutes) {
    this.deregisterServiceAfterInMinutes = deregisterServiceAfterInMinutes;
  }

  @Override
  public String toString() {
    return "DpService{" +
      "serviceId='" + serviceId + '\'' +
      ", serviceTags=" + serviceTags +
      ", port=" + host +
      ", port=" + port +
      '}';
  }


  public Integer getHealthCheckIntervalInSecs() {
    return healthCheckIntervalInSecs;
  }

  public void setHealthCheckIntervalInSecs(Integer healthCheckIntervalInSecs) {
    this.healthCheckIntervalInSecs = healthCheckIntervalInSecs;
  }

  public String getServiceName() {
    return serviceName;
  }

  public String getHost() {
    return host;
  }
}
