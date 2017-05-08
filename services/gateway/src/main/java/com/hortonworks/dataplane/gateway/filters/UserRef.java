package com.hortonworks.dataplane.gateway.filters;


import com.fasterxml.jackson.annotation.JsonProperty;

import java.io.Serializable;

public class UserRef implements Serializable {

  private String id;
  private String avatar;
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

}
