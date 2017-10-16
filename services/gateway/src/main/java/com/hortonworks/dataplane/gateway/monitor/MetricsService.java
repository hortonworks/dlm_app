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
package com.hortonworks.dataplane.gateway.monitor;


import com.codahale.metrics.JmxReporter;
import com.codahale.metrics.MetricRegistry;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import javax.annotation.PostConstruct;


@Component
public class MetricsService {

  private static Logger log = LoggerFactory.getLogger(MetricsService.class);

  @Autowired
  private MetricRegistry registry;

  public MetricRegistry getRegistry() {
    return registry;
  }

  @PostConstruct
  public void init(){
    log.info("Starting JMX reporter");
    final JmxReporter reporter = JmxReporter.forRegistry(registry).build();
    reporter.start();
  }


}
