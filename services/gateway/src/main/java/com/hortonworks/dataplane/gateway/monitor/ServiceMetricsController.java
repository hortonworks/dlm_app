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


import com.fasterxml.jackson.annotation.JsonProperty;
import com.google.common.collect.*;
import com.hortonworks.dataplane.gateway.service.MetricInterface;
import feign.Feign;
import feign.jackson.JacksonDecoder;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cloud.client.discovery.DiscoveryClient;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.net.MalformedURLException;
import java.net.URL;
import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.Stream;


@RestController
@RequestMapping("/service")
public class ServiceMetricsController {

  private static final Map<String,String> METERED_SERVICES = ImmutableMap.of("db","db-service", "clusters","cluster-service", "core", "core","dlm","dlm");
  private static Logger log = LoggerFactory.getLogger(ServiceMetricsController.class);


  @Autowired
  DiscoveryClient client;


  private MetricInterface buildInterface(URL url) {
    return Feign.builder().decoder(new JacksonDecoder()).target(MetricInterface.class, url.toString());
  }


  @RequestMapping("/metrics")
  public Object run() {
    Table<String, String, String> table = HashBasedTable.create();
    List<String> services = client.getServices();
    Stream<Service> listStream = services.stream().filter(s -> METERED_SERVICES.keySet().contains(s)).map(s -> {

      List<org.springframework.cloud.client.ServiceInstance> instances = client.getInstances(s);
      List<ServiceInstance> urlList = instances.stream().map(serviceInstance -> {
        try {
          String protocol = serviceInstance.isSecure() ? "https" : "http";
          return Optional.of(new ServiceInstance(serviceInstance.getHost() + ":" + serviceInstance.getPort(), new URL(protocol + "://" + serviceInstance.getHost() + ":" + serviceInstance.getPort())));
        } catch (MalformedURLException e) {
          log.error("Service URL was malformed", e);
        }
        return Optional.empty();
      }).filter(Optional::isPresent).map(u -> ((Optional<ServiceInstance>) u).get()).collect(Collectors.toList());

      return new Service(s, urlList);

    });


    listStream.forEach(service -> {
      service.getServiceInstance().forEach(instance -> {
        table.put(METERED_SERVICES.get(service.getName()), instance.getName(), instance.getService().toString());
      });
    });


    //Finally get info from each service
    HashSet<ServiceEndpoint> sepSet = Sets.newHashSet();
    table.cellSet().forEach(cell -> {
      try {
        ServiceEndpoint sep = new ServiceEndpoint(cell.getRowKey(),cell.getColumnKey(),cell.getValue()+"/metrics");
        sepSet.add(sep);
      } catch (Throwable th) {
        log.error("Cannot get endpoint info for service " + cell.getRowKey() + ":" + cell.getColumnKey());
      }
    });

    return sepSet;
  }

  private static class Service {
    private String name;
    private List<ServiceInstance> serviceInstance;

    public Service(String name, List<ServiceInstance> serviceInstance) {
      this.name = name;
      this.serviceInstance = serviceInstance;
    }

    public String getName() {
      return name;
    }

    public List<ServiceInstance> getServiceInstance() {
      return serviceInstance;
    }
  }


  private static class ServiceInstance {
    private String name;
    private URL services;

    public ServiceInstance(String name, URL services) {
      this.name = name;
      this.services = services;
    }

    public String getName() {
      return name;
    }

    public URL getService() {
      return services;
    }
  }

  private class ServiceEndpoint{
    private String service;
    private String instance;

    @JsonProperty("metrics_url")
    private String metricsUrl;

    public String getMetricsUrl() {
      return metricsUrl;
    }

    public void setMetricsUrl(String metricsUrl) {
      this.metricsUrl = metricsUrl;
    }

    public String getService() {
      return service;
    }

    public void setService(String service) {
      this.service = service;
    }

    public String getInstance() {
      return instance;
    }

    public void setInstance(String instance) {
      this.instance = instance;
    }

    public ServiceEndpoint(String service, String instance, String metricsUrl){
      this.service = service;
      this.instance = instance;
      this.metricsUrl = metricsUrl;
    }

  }

}
