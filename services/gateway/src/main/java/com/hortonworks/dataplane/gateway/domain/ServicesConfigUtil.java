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
package com.hortonworks.dataplane.gateway.domain;


import com.netflix.zuul.context.RequestContext;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

import static org.springframework.cloud.netflix.zuul.filters.support.FilterConstants.SERVICE_ID_KEY;

@Component
public class ServicesConfigUtil {

  private ArrayList<ServiceConfig> serviceConfigs=new ArrayList<>();
  public ServicesConfigUtil() {
    serviceConfigs.add(new ServiceConfig("dlm",new String[]{"dlmapp"}));
    serviceConfigs.add(new ServiceConfig("dss",new String[]{"dssapp"},new String[]{"/api/dataset", "/api/dataset-tag"}));
  }


  public boolean isRouteAllowed(List<String> services) {
    RequestContext ctx = RequestContext.getCurrentContext();
    String zuulServiceId = ctx.get(SERVICE_ID_KEY).toString();
    for(ServiceConfig serviceConfig:this.serviceConfigs){
      if (serviceConfig.matches(zuulServiceId,ctx.getRequest().getServletPath())) {
        return services.contains(serviceConfig.getServiceId());
      }
    }
    return true;
  }

  private class ServiceConfig {
    private String serviceId;
    private List<String> allowedZuulServiceIds;
    private List<String> paths;

    public ServiceConfig(String serviceId, String[] allowedZuulServiceIds) {
      this(serviceId,allowedZuulServiceIds,null);
    }

    public ServiceConfig(String serviceId,String[] allowedZuulServiceIds, String[] paths) {
      this.serviceId = serviceId;
      this.allowedZuulServiceIds=new ArrayList<>();
      if (allowedZuulServiceIds!=null){
        for(String zuulServiceId:allowedZuulServiceIds){
          this.allowedZuulServiceIds.add(zuulServiceId);
        }
      }
      this.paths=new ArrayList<>();
      if (paths!=null){
        for(String path:paths){
          this.paths.add(path);
        }
      }
    }

    public String getServiceId() {
      return serviceId;
    }

    public boolean matches(String zuulServiceId, String servletPath){
      if (this.paths.isEmpty()){
        return allowedZuulServiceIds.contains(zuulServiceId);
      }else{
        if (allowedZuulServiceIds.contains(zuulServiceId)){
          for(String path:paths){
            if (servletPath.contains(path)){
              return true;
            }
          }
          return false;
        }else{

          return false;
        }
      }
    }

  }
}
