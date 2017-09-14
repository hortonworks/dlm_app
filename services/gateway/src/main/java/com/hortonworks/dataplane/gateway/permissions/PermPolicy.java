package com.hortonworks.dataplane.gateway.permissions;

import org.springframework.cloud.netflix.zuul.filters.Route;

import java.util.ArrayList;
import java.util.List;

public class PermPolicy {
  private List<RoutePerm> routePerms = new ArrayList<>();

  public List<RoutePerm> getRoutePerms() {
    return routePerms;
  }

  public void setRoutePerms(List<RoutePerm> routePerms) {
    this.routePerms = routePerms;
  }

  @Override
  public String toString() {
    return "PermPolicy{" +
        "routePerms=" + routePerms +
        '}';
  }
}

