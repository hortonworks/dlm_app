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

public interface ConsulHook {

  void onServiceRegistration(DpService dpService);

  void onServiceCheck(String serviceId);

  void serviceRegistrationFailure(String serviceId,Throwable th);

  void onRecoverableException(String reason, Throwable th);

  void onServiceDeRegister(String serviceId);

  void gatewayDiscovered(ZuulServer zuulServer);

  void gatewayDiscoverFailure(String message, Throwable th);
}
