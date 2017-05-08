package com.hortonworks.datapalane.consul;

import com.ecwid.consul.v1.health.model.HealthService;
import com.google.common.base.Supplier;
import com.typesafe.config.Config;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Random;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;


/**
 * Client Gateway component
 * By convention all service URL's
 * should be first picked up from System.properties and then from
 * the underlying configuration
 *
 * Clients should construct a Gateway with
 * the configuration and a map of service endpoints to
 * be written into System properties
 *
 * This component will periodically check for zuul
 * to be available and use of the servers to construct the
 * target url and write it into system properties
 */
public class Gateway {

  public static final int INITIAL_DELAY = 1;
  private final Config config;
  private final Map<String, String> serviceConfigs;
  private final Optional<ConsulHook> consulHook;
  private final DpConsulClientImpl dpConsulClient;
  private Supplier<List<ZuulServer>> supplier;
  private ScheduledExecutorService scheduledExecutorService = Executors.newSingleThreadScheduledExecutor();


  public Gateway(Config config, Map<String, String> serviceConfigs, Optional<ConsulHook> consulHook) {
    this.config = config;
    this.serviceConfigs = serviceConfigs;
    this.consulHook = consulHook;
    String host = config.getString("consul.host");
    int port = config.getInt("consul.port");
    dpConsulClient = new DpConsulClientImpl(new ConsulEndpoint(host, port));
    supplier = new ServerListSupplier(dpConsulClient);
  }

  /**
   * Overwrite the system property
   */
  public void initialize() {
    final Random randomizer = new Random();
    int refresh = 60;
    if (!config.getIsNull("gateway.refresh.servers.secs")) {
      refresh = config.getInt("gateway.refresh.servers.secs");
    }
    Runnable runnable = () -> {
      try {
        List<ZuulServer> zuulServers = supplier.get();
        if (zuulServers.size() == 0)
          throw new Exception("No Zuul servers found");
        ZuulServer zuulServer = zuulServers.get(randomizer.nextInt(zuulServers.size()));
        serviceConfigs.forEach((k, v) -> {
          System.setProperty(k, zuulServer.makeUrl(config.getBoolean("gateway.ssl.enabled")) + v);
        });
        if (consulHook.isPresent() && zuulServers.size() > 0) {
          consulHook.get().gatewayDiscovered(zuulServer);
        }
      } catch (Throwable th) {
        serviceConfigs.forEach((k, v) -> {
          System.clearProperty(k);
        });
        if (consulHook.isPresent()) {
          consulHook.get().gatewayDiscoverFailure("Error getting gateway URL, removing service configs from System, fallback will proceed", th);
        }

      }
    };

    scheduledExecutorService.scheduleAtFixedRate(runnable, INITIAL_DELAY, refresh, TimeUnit.SECONDS);

  }

  private static class ServerListSupplier implements Supplier<List<ZuulServer>> {


    private final DpConsulClient dpConsulClient;

    public ServerListSupplier(DpConsulClient dpConsulClient) {
      this.dpConsulClient = dpConsulClient;
    }

    @Override
    public List<ZuulServer> get() {
      ConsulResponse<List<HealthService>> zuul = dpConsulClient.getService();
      List<HealthService> value = zuul.getUnderlying().getValue();
      return value.stream().map(healthService ->
        new ZuulServer(healthService.getService().getAddress(),
          healthService.getService().getPort(),
          healthService.getNode().getNode()))
        .collect(Collectors.toList());
    }
  }


}
