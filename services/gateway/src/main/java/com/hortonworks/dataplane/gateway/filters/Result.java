package com.hortonworks.dataplane.gateway.filters;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.io.Serializable;
import java.util.List;

public class Result implements Serializable {

  private List<User> results;

  @JsonProperty
  public List<User> getResults() {
    return results;
  }

  public void setResults(List<User> results) {
    this.results = results;
  }
}
