package com.hortonworks.dataplane.gateway.domain;


import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

public class DpErrors {
  private List<DpError> errors;

  @JsonProperty
  public List<DpError> getErrors() {
    return errors;
  }

  public void setErrors(List<DpError> errors) {
    this.errors = errors;
  }
  public boolean hasErrors(){
    return this.getErrors()!=null && this.getErrors().size()>0;
  }
  public DpError getFirstError(){
    if (this.getErrors().size()>0){
      return this.getErrors().get(0);
    }else{
      return null;
    }
  }
}
