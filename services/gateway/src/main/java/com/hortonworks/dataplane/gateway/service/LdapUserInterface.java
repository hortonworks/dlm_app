package com.hortonworks.dataplane.gateway.service;

import com.hortonworks.dataplane.gateway.domain.UserContext;
import org.springframework.cloud.netflix.feign.FeignClient;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;

@FeignClient("dpapp")
public interface LdapUserInterface {

  @RequestMapping(method = RequestMethod.POST, value = "api/users/withLdapGroups")
  UserContext addUserFromLdapGroupsConfiguration(@RequestParam(value="userName")String userName);
}
