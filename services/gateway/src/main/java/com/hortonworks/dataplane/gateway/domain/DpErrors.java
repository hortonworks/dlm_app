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
