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

import com.hortonworks.dataplane.gateway.domain.BlacklistedToken;
import org.springframework.cloud.netflix.feign.FeignClient;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;

@FeignClient("db")
public interface BlacklistedTokenServiceInterface {
  @RequestMapping(method = RequestMethod.GET, value = "/blacklisted-tokens")
  BlacklistedToken getToken(@RequestParam("token") String token);

  @RequestMapping(method = RequestMethod.POST, value = "/blacklisted-tokens", consumes = "application/json", produces = "application/json")
  void insert(BlacklistedToken token);

}
