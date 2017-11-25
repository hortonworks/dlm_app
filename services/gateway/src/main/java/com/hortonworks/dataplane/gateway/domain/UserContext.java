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

import java.io.Serializable;

import java.util.List;
@JsonIgnoreProperties(ignoreUnknown = true)
public class UserContext implements Serializable {

  private Long id;
  private String username;
  private String avatar;
  private List<String> roles;
  private List<String> services;
  private String display;
  private String password;
  private boolean active;
  private boolean dbManaged;
  private boolean groupManaged;
  private Long updatedAt;

  public UserContext() {
  }

  @JsonProperty
  public String getUsername() {
    return username;
  }

  public void setUsername(String username) {
    this.username = username;
  }

  @JsonProperty
  public Long getId() {
    return id;
  }

  public void setId(Long id) {
    this.id = id;
  }

  @JsonProperty
  public String getAvatar() {
    return avatar;
  }

  public void setAvatar(String avatar) {
    this.avatar = avatar;
  }

  @JsonProperty
  public String getDisplay() {
    return display;
  }

  public void setDisplay(String display) {
    this.display = display;
  }

  @JsonProperty
  public String getPassword() {
    return password;
  }

  public void setPassword(String password) {
    this.password = password;
  }

  @JsonProperty
  public Long getUpdatedAt() {
    return updatedAt;
  }

  public void setUpdatedAt(Long updatedAt) {
    this.updatedAt = updatedAt;
  }

  @JsonProperty
  public boolean isActive() {
    return active;

  }
  @JsonProperty
  public boolean isGroupManaged() {
    return groupManaged;
  }

  public void setGroupManaged(boolean groupManaged) {
    this.groupManaged = groupManaged;
  }

  public void setActive(boolean active) {
    this.active = active;
  }

  @JsonProperty
  public List<String> getServices() {
    return services;
  }

  public void setServices(List<String> services) {
    this.services = services;
  }

  @JsonProperty
  public List<String> getRoles() {
    return roles;
  }

  public void setRoles(List<String> roles) {
    this.roles = roles;
  }

  @JsonProperty
  public boolean isDbManaged() {
    return dbManaged;
  }

  public void setDbManaged(boolean dbManaged) {
    this.dbManaged = dbManaged;
  }


}
