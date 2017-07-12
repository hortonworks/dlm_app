package com.hortonworks.dataplane.gateway.domain;

import com.google.common.base.Optional;
import io.jsonwebtoken.Claims;

import java.util.Date;

public class TokenInfo {
  private Claims claims;

  public String getSubject(){
    return claims!=null?claims.getSubject():null;
  }
  public void setClaims(Claims claims) {
    this.claims = claims;
  }
  public boolean isValid() {
    return claims != null && !isExpired(claims.getExpiration());
  }

  private boolean isExpired(Date expiration) {
    if (expiration==null){
      return true;//if expiration is null, it means infinite validity
    }
    return expiration.before(new Date());
  }

  public Optional<Date> getExpiryTime(){
    if (claims.getExpiration()!=null) {
      return Optional.fromNullable(claims.getExpiration());
    }else{
      return Optional.absent();
    }
  }
}
