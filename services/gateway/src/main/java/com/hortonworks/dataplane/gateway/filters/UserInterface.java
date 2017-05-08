package com.hortonworks.dataplane.gateway.filters;

import org.springframework.cloud.netflix.feign.FeignClient;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;

@FeignClient("database")
public interface UserInterface {

  @RequestMapping(method = RequestMethod.GET, value = "/users")
  Result getStores(@RequestParam(value="username") String name);

}
