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

package com.hortonworks.datapalane.consul;

import com.typesafe.config.Config;
import org.springframework.cloud.commons.util.InetUtils;
import org.springframework.cloud.commons.util.InetUtilsProperties;

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
  private InetUtils inetUtils=new InetUtils(new InetUtilsProperties());

  private String DEREGISTER_CRITICAL_SERIVE_TTL_PROPNAME="consul.service.deregister.afterMinutes";
  public ApplicationRegistrar(Config config, Optional<ConsulHook> hook) {
    this.config = config;
    this.hook = hook;
  }

  public void initialize() {
    String consulHost = config.getString("consul.host");
    int consulPort = config.getInt("consul.port");
    DpConsulClientImpl dpConsulClient = new DpConsulClientImpl(new ConsulEndpoint(consulHost, consulPort));

    String serviceName = config.getString("consul.serviceName");
    List<String> seriveTags = config.getStringList("consul.service.tags");
    int servicePort = config.getInt("consul.service.port");
    String serviceId = generateServiceId(serviceName,servicePort);
    DpService dpService = new DpService(serviceId, serviceName, seriveTags, getServiceAddress(),servicePort);

    if (config.hasPath(DEREGISTER_CRITICAL_SERIVE_TTL_PROPNAME) && !config.getIsNull(DEREGISTER_CRITICAL_SERIVE_TTL_PROPNAME)) {
      int deregisterServiceAfter = config.getInt(DEREGISTER_CRITICAL_SERIVE_TTL_PROPNAME);
      dpService.setDeregisterServiceAfterInMinutes(deregisterServiceAfter);
    }
    ClientStart clientStartTask = new ClientStart(dpConsulClient, dpService, hook);
    ClientStatus clientStatusTask = new ClientStatus(dpConsulClient, dpService, hook);
    ExecutionHandler executionHandler = new ExecutionHandler(scheduledExecutorService, () -> clientStartTask, () -> clientStatusTask, config, hook);
    clientStartTask.setExecutionHandler(Optional.of(executionHandler));
    clientStatusTask.setExecutionHandler(Optional.of(executionHandler));
    scheduledExecutorService.schedule(clientStartTask, 2, TimeUnit.SECONDS);
    Runtime.getRuntime().addShutdownHook(new ShutdownHook(dpConsulClient, dpService, hook,scheduledExecutorService));
  }
  private String getServiceAddress() {
    return inetUtils.findFirstNonLoopbackAddress().getHostAddress();
  }
  private String generateServiceId(String serviceName,int servicePort){
    return String.format("%s_%s:%d",serviceName,this.getServiceAddress(),servicePort);
  }

  private static class ExecutionHandler {

    private final ScheduledExecutorService executorService;
    private final Supplier<ClientStart> clientStartSupplier;
    private final Supplier<ClientStatus> clientStatusSupplier;
    private final Config config;
    private final Optional<ConsulHook> hook;

    public ExecutionHandler(ScheduledExecutorService executorService, Supplier<ClientStart> clientStartSupplier,
                            Supplier<ClientStatus> clientStatusSupplier, Config config, Optional<ConsulHook> hook) {
      this.executorService = executorService;
      this.clientStartSupplier = clientStartSupplier;
      this.clientStatusSupplier = clientStatusSupplier;
      this.config = config;
      this.hook = hook;
    }

    void onFailure() {
      int retryInterval = getRetryInterval();
      executorService.schedule(clientStartSupplier.get(), retryInterval, TimeUnit.SECONDS);
    }

    private int getRetryInterval() {
      int retryInterval = 5;
      try {
        retryInterval = config.getInt("consul.client.connect.failure.retry.secs");
      } catch (Throwable th) {
        if (hook.isPresent()) {
          hook.get().onRecoverableException("Recovered from a config load exception (consul.client.connect.failure.retry.secs) with a default value " + retryInterval, th);
        }
      }
      return retryInterval;
    }

    void onSuccess() {
      int retryInterval = getRetryInterval();
      // registration was successful
      // schedule a consul health check which
      // checks if the service is already registered in consul
      // if yes then repeat the check after a predefined interval
      // if the check fails - consul down/otherwise, start the
      // registration loop all over again
      executorService.schedule(clientStatusSupplier.get(), retryInterval, TimeUnit.SECONDS);
    }
  }


  private static class ClientStart implements Runnable {

    private final DpConsulClient dpConsulClient;
    private Optional<ExecutionHandler> executionHandler = Optional.empty();
    private final DpService dpService;
    private final Optional<ConsulHook> consulHook;

    public void setExecutionHandler(Optional<ExecutionHandler> executionHandler) {
      this.executionHandler = executionHandler;
    }

    public ClientStart(DpConsulClient dpConsulClient, DpService dpService, Optional<ConsulHook> consulHook) {
      this.dpConsulClient = dpConsulClient;
      this.dpService = dpService;
      this.consulHook = consulHook;
    }

    @Override
    public void run() {
      try {
        dpConsulClient.registerService(dpService);
        consulHook.ifPresent(consulHook -> consulHook.onServiceRegistration(dpService));
        dpConsulClient.registerCheck(dpService);
        executionHandler.ifPresent(ExecutionHandler::onSuccess);
        // if at any point in time consul is
      } catch (Throwable th) {
        consulHook.ifPresent(consulHook -> consulHook.serviceRegistrationFailure(dpService.getServiceId(), th));
        executionHandler.ifPresent(ExecutionHandler::onFailure);
      }
    }
  }


  private static class ClientStatus implements Runnable {

    private final DpConsulClient dpConsulClient;
    private Optional<ExecutionHandler> executionHandler = Optional.empty();
    private final DpService dpService;
    private final Optional<ConsulHook> consulHook;

    public void setExecutionHandler(Optional<ExecutionHandler> executionHandler) {
      this.executionHandler = executionHandler;
    }

    public ClientStatus(DpConsulClient dpConsulClient, DpService dpService, Optional<ConsulHook> consulHook) {
      this.dpConsulClient = dpConsulClient;
      this.dpService = dpService;
      this.consulHook = consulHook;
    }

    @Override
    public void run() {
      try {
        String serviceId = dpService.getServiceId();
        boolean available = dpConsulClient.checkServiceAvailability(serviceId);
        consulHook.ifPresent(consulHook -> consulHook.onServiceCheck(serviceId));
        if (available)
          executionHandler.ifPresent(ExecutionHandler::onSuccess);
        else
          executionHandler.ifPresent(ExecutionHandler::onFailure);
        // if at any point in time consul is
      } catch (Throwable th) {
        consulHook.ifPresent(consulHook -> consulHook.onRecoverableException("Service availability could not be confirmed, " +
          "Fault was recovered and we will attempt a reregistration", th));
        executionHandler.ifPresent(ExecutionHandler::onFailure);
      }
    }
  }


  private static class ShutdownHook extends Thread {


    private final DpConsulClient dpConsulClient;
    private final DpService dpService;
    private final Optional<ConsulHook> consulHook;
    private final ScheduledExecutorService scheduledExecutorService;

    public ShutdownHook(DpConsulClient dpConsulClient, DpService dpService, Optional<ConsulHook> consulHook, ScheduledExecutorService scheduledExecutorService) {
      this.dpConsulClient = dpConsulClient;
      this.dpService = dpService;
      this.consulHook = consulHook;
      this.scheduledExecutorService = scheduledExecutorService;
    }

    @Override
    public void run() {
      try {
        String serviceId = dpService.getServiceId();
        dpConsulClient.unRegisterService(serviceId);
        dpConsulClient.unRegisterCheck(serviceId);
        scheduledExecutorService.shutdown();
        consulHook.ifPresent(consulHook -> consulHook.onServiceDeRegister(serviceId));
      } catch (Throwable th) {
        consulHook.ifPresent(consulHook -> consulHook.onRecoverableException("ShutDown hook failed", th));
      }
    }
  }

}
