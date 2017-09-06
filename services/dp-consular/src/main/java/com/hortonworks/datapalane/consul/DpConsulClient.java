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

import com.ecwid.consul.v1.health.model.HealthService;
import com.hortonworks.datapalane.consul.model.ConsulEvent;
import com.hortonworks.datapalane.consul.model.ConsulEventResp;

import java.util.List;

interface DpConsulClient {

  ConsulResponse registerService(DpService service);
  ConsulResponse registerCheck(DpService service);
  ConsulResponse unRegisterService(String serviceId);
  ConsulResponse unRegisterCheck(String serviceId);
  ConsulResponse<List<HealthService>> getService();
  boolean checkServiceAvailability(String serviceId);
  public ConsulEventResp fireEvent(ConsulEvent event);
}
