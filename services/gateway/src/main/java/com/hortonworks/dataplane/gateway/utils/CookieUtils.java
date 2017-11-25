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
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.servlet.http.Cookie;
import java.util.Arrays;
import java.util.Date;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Component
public class CookieUtils {
  private static final Logger logger = LoggerFactory.getLogger(CookieUtils.class);

  @Value("${sso.cookie.name}")
  private String KNOX_SSO_COOKIE;

  public String getDataplaneToken() {
    Optional<Cookie> cookie = getCookie(Constants.DP_JWT_COOKIE);
    if(cookie.isPresent()) {
      return cookie.get().getValue();
    }
    return null;
  }

  public String getKnoxToken() {
    Optional<Cookie> cookie = getCookie(KNOX_SSO_COOKIE);
    if(cookie.isPresent()) {
      return cookie.get().getValue();
    }
    return null;
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

  public boolean isRelevant(String name) {
    List<String> cookieNames = Arrays.asList(Constants.DP_JWT_COOKIE, KNOX_SSO_COOKIE);
    return cookieNames.contains(name);
  }

  public Cookie buildDeleteCookie(Cookie cookie, String host) {
    if(cookie.getName().equals(KNOX_SSO_COOKIE) && getKnoxDomainFromUrl(host) != null) {
      cookie.setDomain(getKnoxDomainFromUrl(host));
    }
    cookie.setValue(null);
    cookie.setPath("/");
    cookie.setHttpOnly(true);
    cookie.setMaxAge(0);

    return cookie;
  }

  public Cookie buildNewCookie(String key, String value, Date expiry) {
    Cookie cookie = new Cookie(key, value);
    cookie.setPath("/");
    cookie.setHttpOnly(true);
    cookie.setMaxAge((int)((expiry.getTime() - new Date().getTime()) / 1000));

    return cookie;
  }

  /**
  * copied from knox. this is how knox determines domain for a hadoop cookie.
  */
  private String  getKnoxDomainFromUrl(String domain){
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
    return domain.substring(idx + 1);
  }

  private int dotOccurrences(String domain) {
    return domain.length() - domain.replace(".", "").length();
  }

  private boolean isIp(String domain) {
    Pattern p = Pattern.compile("^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$");
    Matcher m = p.matcher(domain);
    return m.find();
  }

}
