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
import feign.FeignException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class ConfigurationService {
  private static final Logger logger = LoggerFactory.getLogger(ConfigurationService.class);
  @Autowired
  private ConfigurationServiceInterface configurationServiceInterface;

  private static final String DP_SESSION_TIMEOUT_KEY = "dp.session.timeout.minutes";

  public boolean isLdapConfigured() {
    try {
      KnoxConfigurationResponse knoxStatus = configurationServiceInterface.getKnoxStatus();
      return knoxStatus.getConfigured();
    } catch (FeignException e) {
      logger.error("error while calling configuration service", e);
      throw new RuntimeException(e);//TODO should we just sned false?
    }
  }


  public Long getJwtTokenValidity() {
    try {
      String validityStr = configurationServiceInterface.getTokenValidity(DP_SESSION_TIMEOUT_KEY);
      if (validityStr.isEmpty()) {
        return -1L;
      }
      return Long.parseLong(validityStr);
    } catch (FeignException e) {
      logger.error("error while calling configuration service", e);
      throw new RuntimeException(e);
    }
  }
}
