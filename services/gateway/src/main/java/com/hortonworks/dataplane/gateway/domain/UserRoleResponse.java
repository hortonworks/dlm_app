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
