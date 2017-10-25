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

import com.fasterxml.jackson.annotation.JsonProperty;

import java.io.Serializable;

public class UserRoleResponse implements Serializable {

  public UserRoleResponse() {
  }

  private UserRoles results;

  @JsonProperty
  public UserRoles getResults() {
    return results;
  }

  public void setResults(UserRoles results) {
    this.results = results;
  }
}
