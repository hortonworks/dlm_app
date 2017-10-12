package com.hortonworks.dataplane.gateway.monitor;


import com.google.common.collect.HashBasedTable;
import com.google.common.collect.Maps;
import com.google.common.collect.Sets;
import com.google.common.collect.Table;
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
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;
import java.util.stream.Stream;


@RestController
@RequestMapping("/service")
public class ServiceMetricsController {

  private static final HashSet<String> METERED_SERVICES = Sets.newHashSet("dpdb", "clusters", "dpapp", "dlmapp");
  private static Logger log = LoggerFactory.getLogger(ServiceMetricsController.class);


  @Autowired
  DiscoveryClient client;


  private MetricInterface buildInterface(URL url) {
    return Feign.builder().decoder(new JacksonDecoder()).target(MetricInterface.class, url.toString());
  }


  @RequestMapping("/metrics")
  public Object run() {
    Table<String, String, MetricInterface> table = HashBasedTable.create();
    List<String> services = client.getServices();
    Stream<Service> listStream = services.stream().filter(s -> METERED_SERVICES.contains(s)).map(s -> {

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


    listStream.forEach(service -> service.getServiceInstance().forEach(instance -> table.put(service.getName(), instance.getName(), buildInterface(instance.getService()))));


    //Finally get metrics from each service
    Map<String, Object> map = Maps.newHashMap();
    table.cellSet().forEach(cell -> {
      try {
        map.put(cell.getRowKey() + ":" + cell.getColumnKey(), cell.getValue().getMetrics());
      } catch (Throwable th) {
        log.error("Cannot get metric for service " + cell.getRowKey() + ":" + cell.getColumnKey());
      }
    });

    return map;
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


}
