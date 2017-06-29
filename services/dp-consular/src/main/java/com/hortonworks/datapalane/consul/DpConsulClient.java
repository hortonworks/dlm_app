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
