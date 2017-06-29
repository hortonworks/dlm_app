package com.hortonworks.datapalane.consul;

import com.ecwid.consul.v1.health.model.HealthService;
import com.google.common.base.Supplier;
import com.google.common.collect.Sets;
import com.typesafe.config.Config;

import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Random;
import java.util.Set;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicReference;
import java.util.stream.Collectors;


/**
 * Client Gateway component
 * By convention all service URL's
 * should be first picked up from System.properties and then from
 * the underlying configuration
 * <p>
 * Clients should construct a Gateway with
 * the configuration and a map of service endpoints to
 * be written into System properties
 * <p>
 * This component will periodically check for zuul
 * to be available and use of the servers to construct the
 * target url and write it into system properties
 */
public class Gateway {

  public static final int INITIAL_DELAY = 1;
  public static final int GATEWAY_DISCOVER_RETRY_COUNT = 3;
  public static final int GATEWAY_DISCOVER_RETRY_WAITBETWEEN_INMILLIS = 500;
  private final Config config;
  private final Map<String, String> serviceConfigs;
  private final Optional<ConsulHook> consulHook;
  private final DpConsulClientImpl dpConsulClient;
  private final AtomicReference<Set<ZuulServer>> serverSet;
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
    serverSet = new AtomicReference<>(Sets.newHashSet());
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

        // Simple change detection to avoid overwriting properties on every run
        // Memoize every run so we can just check id any new servers were added
        // if server lists were updated, pick one randomly
        List<ZuulServer> zuulServers = supplier.get();
        HashSet<ZuulServer> currentSet = Sets.newHashSet(zuulServers);
        // IF current set is same as old set do not update properties
        if (!serverSet.get().isEmpty() && currentSet.containsAll(serverSet.get())) {
          consulHook.ifPresent(consulHook -> consulHook.onRecoverableException("Server list not updated since there was no change in Consul", new Exception("Server list not updated")));
          return;
        }

        if (zuulServers.size() == 0)
          throw new Exception("No Zuul servers found");
        ZuulServer zuulServer = zuulServers.get(randomizer.nextInt(zuulServers.size()));
        serviceConfigs.forEach((k, v) -> {
          System.setProperty(k, zuulServer.makeUrl(config.getBoolean("gateway.ssl.enabled")) + v);
        });
        // remember the old server list for next run
        serverSet.set(currentSet);
        if (consulHook.isPresent() && zuulServers.size() > 0) {
          consulHook.get().gatewayDiscovered(zuulServer);
        }
      } catch (Throwable th) {
        serviceConfigs.forEach((k, v) -> {
          System.clearProperty(k);
        });
        consulHook.ifPresent(consulHook -> consulHook.gatewayDiscoverFailure("Error getting gateway URL, removing service configs from System, fallback will proceed", th));

      }
    };

    scheduledExecutorService.scheduleAtFixedRate(runnable, INITIAL_DELAY, refresh, TimeUnit.SECONDS);

  }
  public ZuulServer getGatewayService(){
    List<ZuulServer> zuulServers = null;
    int retryCount=3;
    do{
      zuulServers=supplier.get();
      if (zuulServers.size()>0){
        break;
      }
      try {
        Thread.sleep(GATEWAY_DISCOVER_RETRY_WAITBETWEEN_INMILLIS);
      } catch (InterruptedException e) {
        //Do nothing here
      }
      retryCount--;
    }while (zuulServers.size()<1 && retryCount>0);
    if (zuulServers.size() == 0) {
      throw new RuntimeException("No Zuul servers found");
    }
    final Random randomizer = new Random();
    ZuulServer zuulServer = zuulServers.get(randomizer.nextInt(zuulServers.size()));
    return zuulServer;
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
