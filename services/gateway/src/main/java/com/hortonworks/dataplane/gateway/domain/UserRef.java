package com.hortonworks.dataplane.gateway.domain;


import com.fasterxml.jackson.annotation.JsonProperty;

import java.io.Serializable;
import java.util.List;

public class UserRef implements Serializable {

  private String id;
  private String avatar;
  private List<String> roles;
  private String display;
  private String token;

  public UserRef() {
  }

  @JsonProperty
  public String getId() {
    return id;
  }

  public void setId(String id) {
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
  public String getToken() {
    return token;
  }

  public void setToken(String token) {
    this.token = token;
  }

  @JsonProperty
  public List<String> getRoles() {
    return roles;
  }

  public void setRoles(List<String> roles) {
    this.roles = roles;
  }
}
