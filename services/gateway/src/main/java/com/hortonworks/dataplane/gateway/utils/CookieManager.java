package com.hortonworks.dataplane.gateway.utils;


import com.google.common.base.Optional;
import com.hortonworks.dataplane.gateway.domain.Constants;
import com.netflix.zuul.context.RequestContext;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import javax.servlet.http.Cookie;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.Date;

import static com.hortonworks.dataplane.gateway.domain.Constants.SSO_CHECK_COOKIE_NAME;

@Component
public class CookieManager {
  @Autowired
  private KnoxSso knoxSso;

  @Autowired
  private Utils utils;

  public void setSsoValidCookie() {
    RequestContext ctx = RequestContext.getCurrentContext();
    Cookie cookie = new Cookie(Constants.SSO_CHECK_COOKIE_NAME, Boolean.toString(true));
    cookie.setPath("/");
    cookie.setMaxAge(-1);
    cookie.setHttpOnly(false);
    ctx.getResponse().addCookie(cookie);
  }

  public void deleteSsoValidCookie(){
    deleteCookie(SSO_CHECK_COOKIE_NAME, null);
  }

  public Optional<Cookie> getKnoxSsoCookie() {
    return getCookie(knoxSso.getSsoCookieName());
  }
  public void deleteKnoxSsoCookie(){
    deleteCookie(knoxSso.getSsoCookieName(), knoxSso.getCookieDomain());
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
    deleteCookie(Constants.DP_JWT_COOKIE,null);//The token might have been expired.
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
    if (expiryTime.isPresent()){
      Date now=new Date();
      int expiryInSecs=(int)(expiryTime.get().getTime()-now.getTime())/1000;
      cookie.setMaxAge(expiryInSecs);
    }
    ctx.getResponse().addCookie(cookie);
  }

  private void deleteCookie(String cookieName,String domain) {
    if (domain==null){
      domain=getDomainFromRequest();
    }
    Optional<Cookie> cookieOpt = getCookie(cookieName);
    if (cookieOpt.isPresent()) {
      Cookie cookie = cookieOpt.get();
      cookie.setDomain(domain);
      cookie.setPath("/");
      deleteCookie(cookieOpt.get());
    }
  }
  private void deleteCookie(Cookie cookie) {
    RequestContext ctx = RequestContext.getCurrentContext();
    cookie.setMaxAge(0);
    ctx.getResponse().addCookie(cookie);
  }
  private String getDomainFromRequest()  {
    RequestContext ctx = RequestContext.getCurrentContext();
    String requestURLStr = ctx.getRequest().getRequestURL().toString();
    try {
      URI uri = new URI(requestURLStr);
      return uri.getHost();
    } catch (URISyntaxException e) {
      throw new RuntimeException(e);
    }
  }
}