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

import java.time.LocalDateTime;

@JsonIgnoreProperties(ignoreUnknown = true)
public class BlacklistedToken {
  private String token;
  private LocalDateTime expiry;

  public BlacklistedToken() {}

  public BlacklistedToken(String token, LocalDateTime expiry) {
    this.token = token;
    this.expiry = expiry;
  }

  @JsonProperty
  public String getToken() {
    return token;
  }

  public void setToken(String token) {
    this.token = token;
  }

  @JsonProperty
  public LocalDateTime getExpiry() {
    return expiry;
  }

  public void setExpiry(LocalDateTime expiry) {
    this.expiry = expiry;
  }
}
