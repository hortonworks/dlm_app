package com.hortonworks.datapalane.consul;

public interface GatewayHook {

  void gatewayDiscovered(ZuulServer zuulServer);

  void gatewayDiscoverFailure(String message);
}
