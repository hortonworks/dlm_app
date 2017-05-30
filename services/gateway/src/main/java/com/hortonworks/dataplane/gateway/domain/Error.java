package com.hortonworks.dataplane.gateway.domain;


import com.fasterxml.jackson.annotation.JsonProperty;

import java.io.Serializable;

public class Error implements Serializable {

  private String message;
  private String trace;

  public Error(String message, String trace) {
    this.message = message;
    this.trace = trace;
  }

  public Error() {
  }

  @JsonProperty
  public String getMessage() {
    return message;
  }

  public void setMessage(String message) {
    this.message = message;
  }

  @JsonProperty
  public String getTrace() {
    return trace;
  }

  public void setTrace(String trace) {
    this.trace = trace;
  }
}
