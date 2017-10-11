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

  @RequestMapping(method = RequestMethod.POST, value = "/api/users/resyncLdapGroups")
  UserContext resyncUserFromLdapGroupsConfiguration(@RequestParam(value="userName")String userName);
}
