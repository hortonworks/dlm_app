package com.hortonworks.dataplane.gateway.domain;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.io.Serializable;
import java.util.List;

public class UserList implements Serializable {

  private UserContext results;

  @JsonProperty
  public UserContext getResults() {
    return results;
  }

  public void setResults(UserContext results) {
    this.results = results;
  }
}
