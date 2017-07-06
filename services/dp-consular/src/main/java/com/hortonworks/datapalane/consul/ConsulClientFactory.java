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
