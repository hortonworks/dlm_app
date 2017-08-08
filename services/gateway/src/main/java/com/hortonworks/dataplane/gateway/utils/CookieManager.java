package com.hortonworks.dataplane.gateway.utils;


import com.google.common.base.Optional;
import com.hortonworks.dataplane.gateway.domain.Constants;
import com.netflix.zuul.context.RequestContext;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import javax.servlet.http.Cookie;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.Date;

import static com.hortonworks.dataplane.gateway.domain.Constants.SSO_CHECK_COOKIE_NAME;

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
   // deleteCookie(knoxSso.getSsoCookieName(), knoxSso.getCookieDomain());
    deleteCookie(knoxSso.getSsoCookieName());
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
    if (domain==null){
      domain=requestResponseUtils.getDomainFromRequest();
    }
    Optional<Cookie> cookieOpt = getCookie(cookieName);
    if (cookieOpt.isPresent()) {
      Cookie cookie = cookieOpt.get();
      cookie.setDomain(domain);
      cookie.setPath("/");
      deleteCookie(cookieOpt.get());
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

}