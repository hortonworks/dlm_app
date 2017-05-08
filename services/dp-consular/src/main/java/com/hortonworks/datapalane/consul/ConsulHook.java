package com.hortonworks.datapalane.consul;

public interface ConsulHook {

  void onServiceRegistration(DpService dpService);

  void serviceRegistrationFailure(String serviceId,Throwable th);

  void onRecoverableException(String reason, Throwable th);

  void onServiceDeRegister(String serviceId);

  void gatewayDiscovered(ZuulServer zuulServer);

  void gatewayDiscoverFailure(String message, Throwable th);
}
