package com.hortonworks.dataplane.gateway.service;

import com.hortonworks.dataplane.gateway.domain.KnoxConfigurationResponse;
import org.springframework.cloud.netflix.feign.FeignClient;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

@FeignClient("dpapp")
public interface ConfigurationServiceInterface {

  @RequestMapping(method = RequestMethod.GET, value = "/api/knox/status")
  KnoxConfigurationResponse getKnoxStatus();
}
