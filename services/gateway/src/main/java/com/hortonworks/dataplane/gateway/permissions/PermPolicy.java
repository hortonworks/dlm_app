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

