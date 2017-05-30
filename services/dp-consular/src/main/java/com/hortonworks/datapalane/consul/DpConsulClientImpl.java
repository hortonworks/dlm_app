package com.hortonworks.datapalane.consul;

import com.ecwid.consul.v1.ConsulClient;
import com.ecwid.consul.v1.QueryParams;
import com.ecwid.consul.v1.Response;
import com.ecwid.consul.v1.agent.model.NewCheck;
import com.ecwid.consul.v1.agent.model.NewService;
import com.ecwid.consul.v1.agent.model.Service;
import com.ecwid.consul.v1.health.model.HealthService;

import java.util.List;
import java.util.Map;

public class DpConsulClientImpl implements DpConsulClient {

  private final ConsulClient consulClient;

  public DpConsulClientImpl(ConsulEndpoint consul) {
    consulClient = new ConsulClient(consul.getHost(), consul.getPort());
  }

  @Override
  public ConsulResponse registerService(DpService service) {
    // Add the service and register a check
    NewService newService = new NewService();
    newService.setId(service.getServiceId());
    newService.setTags(service.getServiceTags());
    newService.setPort(service.getPort());
    newService.setName(service.getServiceName());
    Response<Void> voidResponse = consulClient.agentServiceRegister(newService);
    return ConsulResponse.from(voidResponse);
  }

  @Override
  public ConsulResponse registerCheck(DpService service) {
    NewCheck newCheck = new NewCheck();
    newCheck.setId(service.getServiceId() + "-healthCheck");
    newCheck.setServiceId(service.getServiceId());
    newCheck.setName(service.getServiceId() + "-healthCheck");
    newCheck.setHttp("http://localhost:" + service.getPort() + "/health");
    newCheck.setInterval(service.getHealthCheckIntervalInSecs() + "s");
    //Set a default timeout to 1s
    newCheck.setTimeout("10s");
    Response<Void> voidResponse = consulClient.agentCheckRegister(newCheck);
    return ConsulResponse.from(voidResponse);
  }

  @Override
  public ConsulResponse unRegisterService(String serviceId) {
    Response<Void> voidResponse = consulClient.agentServiceDeregister(serviceId);
    return ConsulResponse.from(voidResponse);
  }

  @Override
  public ConsulResponse unRegisterCheck(String serviceId) {
    Response<Void> voidResponse = consulClient.agentCheckDeregister(serviceId + "-healthCheck");
    return ConsulResponse.from(voidResponse);
  }

  @Override
  public ConsulResponse<List<HealthService>> getService() {
    Response<List<HealthService>> healthServices = consulClient.getHealthServices("zuul", true, QueryParams.DEFAULT);
    return ConsulResponse.from(healthServices);
  }

  @Override
  public boolean checkServiceAvailability(String serviceId) {
    Response<Map<String, Service>> agentServices = consulClient.getAgentServices();
    return agentServices.getValue().keySet().contains(serviceId);
  }

}
