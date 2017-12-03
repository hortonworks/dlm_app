/*
 * Copyright 2013-2015 the original author or authors.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package com.hortonworks.dataplane.gateway.config;


import com.ecwid.consul.v1.ConsulClient;
import com.ecwid.consul.v1.agent.model.NewService;
import com.google.common.collect.Lists;
import com.typesafe.config.Config;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.annotation.PostConstruct;
import javax.annotation.PreDestroy;


/**
 * Sets up cloudbreak registration if enable.cloudbreak is true
 * In HA mode this may cause multiple registrations which in this case
 * is fine
 */
@Component
public class CloudbreakRegistration {

  private static Logger log = LoggerFactory.getLogger(CloudbreakRegistration.class);

  public static final String DP_GATEWAY_SERVICES_CLOUDBREAK = "dp.gateway.services.cloudbreak";

  @Value("${enable.cloudbreak}")
  private Boolean enableCloudBreak = false;

  @Autowired
  private Config config;

  @Autowired
  private ConsulClient consulClient;


  @PostConstruct
  public void init() {
    Config c = config.getConfig(DP_GATEWAY_SERVICES_CLOUDBREAK);
    if (!enableCloudBreak) {
      // Remove any previous registrations
      consulClient.agentServiceDeregister(c.getString("id"));
      return;
    }

    log.info("Cloudbreak is enabled through enable.cloudbreak, registering a new service");
    NewService newService = new NewService();
    newService.setAddress(c.getString("host"));
    newService.setPort(c.getInt("port"));
    newService.setId(c.getString("id"));
    newService.setName(c.getString("id"));
    newService.setTags(Lists.newArrayList(c.getString("id")));
    consulClient.agentServiceRegister(newService);
  }


  @PreDestroy
  public void deregister() {
    log.info("Removing any registered cloudbreak instances");
    Config c = config.getConfig(DP_GATEWAY_SERVICES_CLOUDBREAK);
    consulClient.agentServiceDeregister(c.getString("id"));

  }


}
