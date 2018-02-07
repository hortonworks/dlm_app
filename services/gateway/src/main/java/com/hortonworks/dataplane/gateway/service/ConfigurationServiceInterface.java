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

import com.hortonworks.dataplane.gateway.domain.KnoxConfigurationResponse;
import org.springframework.cloud.netflix.feign.FeignClient;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

@FeignClient("core")
public interface ConfigurationServiceInterface {

  @RequestMapping(method = RequestMethod.GET, value = "/api/knox/status")
  KnoxConfigurationResponse getKnoxStatus();

  @RequestMapping(method = RequestMethod.GET, value = "/api/config/ga-tracking-status")
  String getGATrackingStatus();

  @RequestMapping(method = RequestMethod.GET, value = "/api/config/{key}")
  String getTokenValidity(@PathVariable("key") String key);

}
