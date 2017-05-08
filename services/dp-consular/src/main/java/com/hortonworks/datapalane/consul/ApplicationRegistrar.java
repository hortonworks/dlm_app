package com.hortonworks.datapalane.consul;

import com.typesafe.config.Config;

import java.util.List;
import java.util.Optional;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;
import java.util.function.Supplier;

public class ApplicationRegistrar {

  private ScheduledExecutorService scheduledExecutorService = Executors.newSingleThreadScheduledExecutor();
  private Config config;
  private Optional<ConsulHook> hook;

  public ApplicationRegistrar(Config config, Optional<ConsulHook> hook) {
    this.config = config;
    this.hook = hook;
  }

  public void initialize() {
    String host = config.getString("consul.host");
    int port = config.getInt("consul.port");
    DpConsulClientImpl dpConsulClient = new DpConsulClientImpl(new ConsulEndpoint(host, port));
    ClientStart clientStart = new ClientStart(dpConsulClient, config, hook);
    ExecutionHandler executionHandler = new ExecutionHandler(scheduledExecutorService, () -> clientStart, config, hook);
    clientStart.setExecutionHandler(Optional.of(executionHandler));
    scheduledExecutorService.schedule(clientStart, 2, TimeUnit.SECONDS);
    Runtime.getRuntime().addShutdownHook(new ShutdownHook(dpConsulClient,config,hook));
  }


  private static class ExecutionHandler {

    private final ScheduledExecutorService executorService;
    private final Supplier<ClientStart> clientStartSupplier;
    private final Config config;
    private final Optional<ConsulHook> hook;

    public ExecutionHandler(ScheduledExecutorService executorService, Supplier<ClientStart> clientStartSupplier, Config config, Optional<ConsulHook> hook) {
      this.executorService = executorService;
      this.clientStartSupplier = clientStartSupplier;
      this.config = config;
      this.hook = hook;
    }

    void onFailure() {
      int retryInterval = 5;
      try {
        retryInterval = config.getInt("consul.client.connect.failure.retry.secs");
      } catch (Throwable th) {
        if (hook.isPresent()) {
          hook.get().onRecoverableException("Retrying Consul connection",th);
        }
      }
      executorService.schedule(clientStartSupplier.get(), retryInterval, TimeUnit.SECONDS);
    }

  }


  private static class ClientStart implements Runnable {

    private final DpConsulClient dpConsulClient;
    private Optional<ExecutionHandler> executionHandler = Optional.empty();
    private final Config config;
    private final Optional<ConsulHook> consulHook;

    public void setExecutionHandler(Optional<ExecutionHandler> executionHandler) {
      this.executionHandler = executionHandler;
    }

    public ClientStart(DpConsulClient dpConsulClient, Config config, Optional<ConsulHook> consulHook) {
      this.dpConsulClient = dpConsulClient;
      this.config = config;
      this.consulHook = consulHook;
    }

    @Override
    public void run() {
      try {
        String serviceId = config.getString("consul.serviceId");
        String name = config.getString("consul.serviceName");
        List<String> tags = config.getStringList("consul.service.tags");
        int port = config.getInt("consul.service.port");
        DpService service = new DpService(serviceId,name ,tags, port);
        dpConsulClient.registerService(service);
        consulHook.ifPresent(consulHook -> consulHook.onServiceRegistration(service));
        dpConsulClient.registerCheck(service);
      } catch (Throwable th) {
        consulHook.ifPresent(consulHook -> consulHook.serviceRegistrationFailure(config.getString("consul.serviceId"), th));
        executionHandler.ifPresent(ExecutionHandler::onFailure);
      }
    }
  }

  private static class ShutdownHook extends Thread{


    private final DpConsulClient dpConsulClient;
    private final Config config;
    private final Optional<ConsulHook> consulHook;

    public ShutdownHook(DpConsulClient dpConsulClient, Config config,Optional<ConsulHook> consulHook) {
      this.dpConsulClient = dpConsulClient;
      this.config = config;
      this.consulHook = consulHook;
    }

    @Override
    public void run() {
      try {
        String serviceId = config.getString("consul.serviceId");
        dpConsulClient.unRegisterService(serviceId);
        dpConsulClient.unRegisterCheck(serviceId);
        consulHook.ifPresent(consulHook -> consulHook.onServiceDeRegister(serviceId));
      } catch (Throwable th){
        consulHook.ifPresent(consulHook -> consulHook.onRecoverableException("ShutDown hook failed", th));
      }
    }
  }


}
