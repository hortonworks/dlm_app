package com.hortonworks.dataplane.gateway.service;

import com.hortonworks.dataplane.gateway.domain.UserList;
import org.springframework.cloud.netflix.feign.FeignClient;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

@FeignClient("dpdb")
public interface UserServiceInterface {
  @RequestMapping(method = RequestMethod.GET, value = "/users/usercontext/{username}")
  UserList getUserContext(@PathVariable("username") String userName);

}
