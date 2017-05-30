package com.hortonworks.dataplane.gateway.utils;

import com.google.common.base.Optional;
import com.hortonworks.dataplane.gateway.domain.Constants;
import com.netflix.zuul.context.RequestContext;
import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cloud.netflix.zuul.filters.ProxyRequestHelper;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;

import javax.servlet.http.Cookie;
import javax.servlet.http.HttpServletRequest;
import java.net.URI;
import java.net.URISyntaxException;

@Component
public class Utils {
  private static final int BEARER_TOK_LEN = "Bearer ".length();
  private static final String BEARER_TOKEN_KEY = "Bearer ";
  @Autowired
  private ProxyRequestHelper proxyRequestHelper;

  public Optional<String> getBearerToken() {
    HttpServletRequest request = RequestContext.getCurrentContext().getRequest();
    String AuthHeader = request.getHeader(Constants.AUTHORIZATION_HEADER);
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
  public void deleteAuthorizationHeaderToUpstream(){
    proxyRequestHelper.addIgnoredHeaders(Constants.AUTHORIZATION_HEADER);
  }
  public Object sendUnauthorized() {
    RequestContext ctx = RequestContext.getCurrentContext();
    ctx.setResponseStatusCode(HttpStatus.UNAUTHORIZED.value());
    ctx.setSendZuulResponse(false);
    return null;
  }

  public Object sendForbidden(String message) {
    RequestContext ctx = RequestContext.getCurrentContext();
    ctx.setResponseStatusCode(HttpStatus.FORBIDDEN.value());
    if (message!=null){
      ctx.setResponseBody(message);
    }
    ctx.setSendZuulResponse(false);
    return null;
  }

  public void deleteCookie(String cookieName,String domain) {
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

  private void deleteCookie(Cookie cookie) {
    RequestContext ctx = RequestContext.getCurrentContext();
    cookie.setMaxAge(0);
    ctx.getResponse().addCookie(cookie);
  }
}
