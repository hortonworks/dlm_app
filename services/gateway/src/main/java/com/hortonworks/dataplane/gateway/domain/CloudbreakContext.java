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

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

@JsonIgnoreProperties(ignoreUnknown = true)
public class CloudbreakContext extends UserContext {

  public CloudbreakContext(){

  }

  public static CloudbreakContext from(UserContext userContext){
    return new CloudbreakContext(userContext);
  }

  private CloudbreakContext(UserContext userContext) {
    this.setActive(userContext.isActive());
    this.setAvatar(userContext.getAvatar());
    this.setDbManaged(userContext.isDbManaged());
    this.setGroupManaged(userContext.isGroupManaged());
    this.setDisplay(userContext.getDisplay());
    this.setPassword("NA");
    this.setId(-1L);
    this.setRoles(userContext.getRoles());
    this.setServices(userContext.getServices());
    this.setUpdatedAt(userContext.getUpdatedAt());
    this.setUsername(userContext.getUsername());
  }

  private String email;
  private String domain;
  private String secret;

  @JsonProperty
  public String getEmail() {
    return email;
  }

  public void setEmail(String email) {
    this.email = email;
  }

  @JsonProperty
  public String getDomain() {
    return domain;
  }

  public void setDomain(String domain) {
    this.domain = domain;
  }

  @JsonProperty
  public String getSecret() {
    return secret;
  }

  public void setSecret(String secret) {
    this.secret = secret;
  }
}
