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

package com.hortonworks.datapalane.consul.model;


public class ConsulEvent {
  private String name;
  private String serviceName;
  private String payload;
/*
Name is the event name. Dont being with underscore.
servicename is optional and is used to filter the event to which service the event will be sent
payload is optinal and would be sent as part of event. if payload is specified it should be less than 100 bytes.
 */
  public ConsulEvent(String name, String serviceName, String payload) {
    if (name==null || name.startsWith("_")){
      throw new RuntimeException("invalid event");
    }
    this.name = name;
    this.serviceName = serviceName;
    this.payload = payload;
  }

  public String getName() {
    return name;
  }

  public String getServiceName() {
    return serviceName;
  }

  public String getPayload() {
    return payload!=null?payload:"";
  }

  @Override
  public String toString() {
    return "ConsulEvent{" +
      "name='" + name + '\'' +
      ", serviceName='" + serviceName + '\'' +
      ", payload='" + payload + '\'' +
      '}';
  }
}
