package com.hortonworks.dataplane.gateway.utils;

import com.google.common.base.Optional;
import com.netflix.zuul.context.RequestContext;
import org.apache.commons.lang3.StringUtils;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;

import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;

@Component
public class Utils {
  private static final int BEARER_TOK_LEN = "Bearer ".length();
  private static final String AUTHORIZATION_HEADER = "Authorization";
  private static final String BEARER_TOKEN_KEY = "Bearer ";

  public Optional<String> getBearerToken() {
    HttpServletRequest request = RequestContext.getCurrentContext().getRequest();
    String AuthHeader = request.getHeader(AUTHORIZATION_HEADER);
    if (StringUtils.isNotBlank(AuthHeader) && AuthHeader.startsWith(BEARER_TOKEN_KEY)) {
      String token = request.getHeader("Authorization").substring(BEARER_TOK_LEN);
      return Optional.of(token);
    }
    return Optional.absent();
  }

  public Optional<Cookie> getCookie(String cookieName) {
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

  public Object sendUnauthorized() {
    RequestContext ctx = RequestContext.getCurrentContext();
    ctx.setResponseStatusCode(HttpStatus.UNAUTHORIZED.value());
    ctx.setSendZuulResponse(false);
    throw new RuntimeException("Request not allowed");
  }

  public Object sendForbidden(String message) {
    RequestContext ctx = RequestContext.getCurrentContext();
    ctx.setResponseStatusCode(HttpStatus.FORBIDDEN.value());
    ctx.setSendZuulResponse(false);
    throw new RuntimeException("Request not allowed");
  }

  public void deleteCookie(String cookieName) {
    Optional<Cookie> cookieOpt = getCookie(cookieName);
    if (cookieOpt.isPresent()) {
      deleteCookie(cookieOpt.get());
    }
  }

  private void deleteCookie(Cookie cookie) {
    RequestContext ctx = RequestContext.getCurrentContext();
    cookie.setMaxAge(0);
    ctx.getResponse().addCookie(cookie);
  }
}
