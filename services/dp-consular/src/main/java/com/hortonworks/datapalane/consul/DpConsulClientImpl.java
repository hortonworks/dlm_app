package com.hortonworks.datapalane.consul;

import com.ecwid.consul.v1.ConsistencyMode;
import com.ecwid.consul.v1.ConsulClient;
import com.ecwid.consul.v1.QueryParams;
import com.ecwid.consul.v1.Response;
import com.ecwid.consul.v1.agent.model.NewCheck;
import com.ecwid.consul.v1.agent.model.NewService;
import com.ecwid.consul.v1.agent.model.Service;
import com.ecwid.consul.v1.event.model.Event;
import com.ecwid.consul.v1.event.model.EventParams;
import com.ecwid.consul.v1.health.model.HealthService;
import com.hortonworks.datapalane.consul.model.ConsulEvent;
import com.hortonworks.datapalane.consul.model.ConsulEventResp;

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
    newService.setAddress(service.getHost());
    Response<Void> voidResponse = consulClient.agentServiceRegister(newService);
    return ConsulResponse.from(voidResponse);
  }

  @Override
  public ConsulResponse registerCheck(DpService service) {
    NewCheck newCheck = new NewCheck();
    newCheck.setId(service.getServiceId() + "-healthCheck");
    newCheck.setServiceId(service.getServiceId());
    newCheck.setName(service.getServiceId() + "-healthCheck");
    newCheck.setHttp(String.format("http://%s:%s/health",service.getHost(),service.getPort()));
    newCheck.setInterval(service.getHealthCheckIntervalInSecs() + "s");
    newCheck.setDeregisterCriticalServiceAfter("2m");
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

  @Override
  public ConsulEventResp fireEvent(ConsulEvent event){
    EventParams eventParams = new EventParams();
    QueryParams queryParams=new QueryParams(ConsistencyMode.CONSISTENT);
    if (event.getServiceName()!=null) {
      eventParams.setService(event.getServiceName());
    }
    Response<Event> resp=consulClient.eventFire(event.getName(),event.getPayload(),eventParams,queryParams);
    ConsulEventResp eventResp=new ConsulEventResp(resp.getValue().getId(),resp.getValue().getlTime());
    return eventResp;
  }
}
