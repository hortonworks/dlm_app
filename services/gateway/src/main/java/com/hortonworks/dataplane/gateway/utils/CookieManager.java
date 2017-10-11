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
package com.hortonworks.dataplane.gateway.utils;


import com.google.common.base.Optional;
import com.hortonworks.dataplane.gateway.domain.Constants;
import com.netflix.zuul.context.RequestContext;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import javax.servlet.http.Cookie;


import java.util.Date;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Component
public class CookieManager {
  private static final Logger logger = LoggerFactory.getLogger(CookieManager.class);

  @Autowired
  private RequestResponseUtils requestResponseUtils;

  @Autowired
  private KnoxSso knoxSso;

  @Autowired
  private Utils utils;

  public Optional<Cookie> getKnoxSsoCookie() {
    return getCookie(knoxSso.getSsoCookieName());
  }
  public void deleteKnoxSsoCookie(){
    deleteCookie(knoxSso.getSsoCookieName(),getKnoxDomainFromUrl());
  }

  public Optional<String> getDataplaneJwtCookie() {
    Optional<Cookie> cookie = getCookie(Constants.DP_JWT_COOKIE);
    if (cookie.isPresent()){
      return Optional.fromNullable(cookie.get().getValue());
    }else{
      return Optional.absent();
    }
  }
  public void deleteDataplaneJwtCookie(){
    if (getCookie(Constants.DP_JWT_COOKIE).isPresent()){
      deleteCookie(getCookie(Constants.DP_JWT_COOKIE).get());
    }else{
      logger.debug("dp-jwt cookie not found in cookies");
    }
  }
  public void addDataplaneJwtCookie(String jwtToken,Optional<Date> expiryTime) {
    addCookie(Constants.DP_JWT_COOKIE, jwtToken,expiryTime);
  }
  private Optional<Cookie> getCookie(String cookieName) {
    RequestContext ctx = RequestContext.getCurrentContext();
    Cookie[] cookies = ctx.getRequest().getCookies();
    if (cookies != null) {
      for (Cookie cookie : cookies) {
        if (cookie.getName().equals(cookieName)) {
          return Optional.of(cookie);
        }
      }
    }
    return Optional.absent();
  }

  private void addCookie(String cookieName,String value,Optional<Date> expiryTime){
    RequestContext ctx = RequestContext.getCurrentContext();
    Cookie cookie=new Cookie(cookieName,value);
    cookie.setPath("/");
    cookie.setHttpOnly(true);
    if (expiryTime.isPresent()){
      Date now=new Date();
      int expiryInSecs=(int)(expiryTime.get().getTime()-now.getTime())/1000;
      cookie.setMaxAge(expiryInSecs);
    }
    ctx.getResponse().addCookie(cookie);
  }

  private void deleteCookie(String cookieName,String domain) {
    Optional<Cookie> cookieOpt = getCookie(cookieName);
    if (cookieOpt.isPresent()) {
      Cookie cookie = cookieOpt.get();
      if (domain!=null){
        cookie.setDomain(domain);
      }
      cookie.setPath("/");
      deleteCookie(cookie);
    }
  }
  private void deleteCookie(String cookieName){
    Optional<Cookie> cookieOpt = getCookie(cookieName);
    if (cookieOpt.isPresent()) {
      Cookie cookie = cookieOpt.get();
      cookie.setPath("/");
      deleteCookie(cookieOpt.get());
    }
  }
  private void deleteCookie(Cookie cookie) {
    RequestContext ctx = RequestContext.getCurrentContext();
    cookie.setMaxAge(0);
    cookie.setPath("/");
    ctx.getResponse().addCookie(cookie);
  }

  /**
   * copied from knox. this is how knox determines domain for a hadoop cookie.
   */
  private String  getKnoxDomainFromUrl(){
    String domain=requestResponseUtils.getDomainFromRequest();
    if (isIp(domain)) {
      return null;
    }
    if (dotOccurrences(domain) < 2) {
      return null;
    }
    int idx = domain.indexOf('.');
    if (idx == -1) {
      idx = 0;
    }
    return domain.substring(idx+1);
  }
  public int dotOccurrences(String domain) {
    return domain.length() - domain.replace(".", "").length();
  }
  public boolean isIp(String domain) {
    Pattern p = Pattern.compile("^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$");
    Matcher m = p.matcher(domain);
    return m.find();
  }
}