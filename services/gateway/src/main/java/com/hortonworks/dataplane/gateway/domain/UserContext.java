package com.hortonworks.dataplane.gateway.domain;


import com.fasterxml.jackson.annotation.JsonProperty;

import java.io.Serializable;
import java.util.List;

public class UserContext implements Serializable {

  private Long id;
  private String username;
  private String avatar;
  private List<String> roles;
  private String display;
  private String token;

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
