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
