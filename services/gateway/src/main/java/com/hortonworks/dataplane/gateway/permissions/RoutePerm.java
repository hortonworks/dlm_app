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

import java.util.Arrays;

public class RoutePerm {
  /**
   * GET/POST/PUT/DELETE/HEAD/OPTIONS
   * Use * for all
   */
  private String method;
  private String path;
  private String[] roles;

  public String getMethod() {
    return method;
  }

  public void setMethod(String method) {
    this.method = method;
  }

  public String getPath() {
    return path;
  }

  public void setPath(String path) {
    this.path = path;
  }

  public String[] getRoles() {
    return roles;
  }

  public void setRoles(String[] roles) {
    this.roles = roles;
  }

  @Override
  public String toString() {
    return "RoutePerm{" +
        "method='" + method + '\'' +
        ", path='" + path + '\'' +
        ", roles=" + Arrays.toString(roles) +
        '}';
  }
}
