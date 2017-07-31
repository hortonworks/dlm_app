package com.hortonworks.dataplane.gateway.service;

import com.hortonworks.dataplane.gateway.domain.UserList;
import com.hortonworks.dataplane.gateway.domain.UserRoleResponse;
import org.springframework.cloud.netflix.feign.FeignClient;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;

@FeignClient("dpdb")
public interface UserServiceInterface {

  @RequestMapping(method = RequestMethod.GET, value = "/users")
  UserList getUser(@RequestParam(value = "username") String name);

  @RequestMapping(method = RequestMethod.GET, value = "/users/role/{userName}")
  UserRoleResponse getRoles(@PathVariable("userName") String userName);


}
