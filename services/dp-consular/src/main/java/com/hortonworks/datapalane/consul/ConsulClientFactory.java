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


import com.typesafe.config.Config;

public class ConsulClientFactory
{
  public static DpConsulClient getConsulClilent(String consulHost,int consulPort){
    DpConsulClientImpl dpConsulClient = new DpConsulClientImpl(new ConsulEndpoint(consulHost, consulPort));
    return dpConsulClient;
  }
  public static DpConsulClient getConsulClilent(Config config){
    String consulHost = config.getString("consul.host");
    int consulPort = config.getInt("consul.port");
    DpConsulClientImpl dpConsulClient = new DpConsulClientImpl(new ConsulEndpoint(consulHost, consulPort));
    return dpConsulClient;
  }
  public static DpConsulClient getConsulClilent(){
    DpConsulClientImpl dpConsulClient = new DpConsulClientImpl(new ConsulEndpoint("localhost", 8500));
    return dpConsulClient;
  }
}
