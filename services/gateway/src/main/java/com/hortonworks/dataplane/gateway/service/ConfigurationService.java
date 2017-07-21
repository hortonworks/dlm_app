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

  public boolean isLdapConfigured() {
    try {
      KnoxConfigurationResponse knoxStatus = configurationServiceInterface.getKnoxStatus();
      return knoxStatus.getConfigured();
    }catch (FeignException e){
      logger.error("error while calling configuration service",e);
      throw new RuntimeException(e);//TODO should we just sned false?
    }
  }
}
