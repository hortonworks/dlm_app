package com.hortonworks.dataplane.gateway.filters;


import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.common.base.Optional;
import com.hortonworks.dataplane.gateway.utils.KnoxSso;
import com.hortonworks.dataplane.gateway.utils.Utils;
import com.hortonworks.dataplane.gateway.domain.Constants;
import com.hortonworks.dataplane.gateway.domain.User;
import com.hortonworks.dataplane.gateway.domain.UserList;
import com.netflix.zuul.ZuulFilter;
import com.netflix.zuul.context.RequestContext;
import feign.FeignException;
import io.jsonwebtoken.JwtException;
import org.apache.commons.codec.binary.Base64;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import javax.servlet.http.Cookie;
import java.io.IOException;

import static com.hortonworks.dataplane.gateway.domain.Constants.*;
import static org.springframework.cloud.netflix.zuul.filters.support.FilterConstants.*;

@Service
public class TokenCheckFilter extends ZuulFilter {
  private static final Logger logger = LoggerFactory.getLogger(TokenCheckFilter.class);
  private static final String AUTH_ENTRY_POINT = "/api/app/auth/in";

  @Autowired
  UserServiceInterface userServiceInterface;

  @Autowired
  private KnoxSso knoxSso;

  @Autowired
  private Utils utils;

  @Autowired
  private Jwt jwt;

  private ObjectMapper objectMapper = new ObjectMapper();

  @Override
  public String filterType() {
    return PRE_TYPE;
  }


  @Override
  public int filterOrder() {
    return PRE_DECORATION_FILTER_ORDER + 5;
  }


  @Override
  public boolean shouldFilter() {
    RequestContext ctx = RequestContext.getCurrentContext();
    String serviceId = ctx.get(SERVICE_ID_KEY).toString();
    // Check if its not a sign in call - Protect everything else
    return serviceId.equals(Constants.DPAPP) && !ctx.getRequest().getServletPath().equals(AUTH_ENTRY_POINT);

  }

  @Override
  public Object run() {
    // Sign in call
    // get user and roles, and create token
    RequestContext ctx = RequestContext.getCurrentContext();
    if (isSsoLogin()) {
      return redirectToKnox(ctx);
    } else if (logout()) {
      return doLogout();
    } else {
      Optional<String> bearerToken = utils.getBearerToken();
      if (bearerToken.isPresent()) {
        utils.deleteAuthorizationHeaderToUpstream();
        return authorizeThroughBearerToken(bearerToken);
      } else if (knoxSso.isSsoConfigured()) {
        return authorizeThroughSso();
      } else {  //TODO validate knox sso.
        return utils.sendForbidden(null);
      }
    }
  }


  private Object doLogout() {
    //TODO call knox gateway to invalidate token in knox gateway server.
    utils.deleteCookie(knoxSso.getSsoCookieName(),knoxSso.getCookieDomain());
    utils.deleteCookie(SSO_CHECK_COOKIE_NAME,null);
    //Note. UI should handle redirect.
    return null;
  }

  private Object authorizeThroughSso() {
    Optional<Cookie> knoxSsoCookie = getKnoxSsoCookie();
    if (!knoxSsoCookie.isPresent()) {
      return utils.sendUnauthorized();
    }
    Optional<String> subjectOptional = knoxSso.validateJwt(knoxSsoCookie.get().getValue());
    if (!subjectOptional.isPresent()) {
      return utils.sendUnauthorized();
    }
    UserList userList=null;
    try{
      userList = userServiceInterface.getUser(subjectOptional.get());
    }catch (FeignException e){
      if (e.status()== HttpStatus.NOT_FOUND.value()){
        return utils.sendForbidden(String.format("User %s not found in the system", subjectOptional.get()));
      }else{
        throw new RuntimeException(e);
      }
    }
    if (userList == null || userList.getResults() == null || userList.getResults().size() < 1) {
      return utils.sendForbidden(null);
    }
    setSsoValidCookie();
    setUpstreamUserContext(userList.getResults().get(0));
    return null;
  }

  private void setSsoValidCookie() {
    RequestContext ctx = RequestContext.getCurrentContext();
    Cookie cookie = new Cookie(Constants.SSO_CHECK_COOKIE_NAME,Boolean.toString(true));
    cookie.setPath("/");
    cookie.setMaxAge(-1);
    cookie.setHttpOnly(false);
    ctx.getResponse().addCookie(cookie);
  }

  private boolean isSsoLogin() {
    RequestContext ctx = RequestContext.getCurrentContext();
    return KNOX_LOGIN_PATH.equals(ctx.getRequest().getServletPath());
  }

  private boolean logout() {
    RequestContext ctx = RequestContext.getCurrentContext();
    return KNOX_LOGOUT_PATH.equals(ctx.getRequest().getServletPath());
  }

  private Object redirectToKnox(RequestContext ctx) {
    String redirectUrl = knoxSso.getLoginUrl(ctx.getRequest().getParameter("landingUrl"));
    try {
      ctx.getResponse().sendRedirect(redirectUrl);
    } catch (IOException e) {
      throw new RuntimeException(e);
    }
    return null;
  }

  private void setUpstreamUserContext(User user) {
    RequestContext ctx = RequestContext.getCurrentContext();
    try {
      user.setPassword("");
      String userJson = objectMapper.writeValueAsString(user);
      ctx.addZuulRequestHeader(DP_USER_INFO_HEADER_KEY,Base64.encodeBase64String( userJson.getBytes()));
    } catch (JsonProcessingException e) {
      throw new RuntimeException(e);
    }
  }

  private Optional<Cookie> getKnoxSsoCookie() {
    return utils.getCookie(knoxSso.getSsoCookieName());
  }

  private Object authorizeThroughBearerToken(Optional<String> bearerToken) {
    try {
      Optional<User> userOptional = jwt.parseJWT(bearerToken.get());
      if (!userOptional.isPresent()) {
        return utils.sendForbidden("User is not present in system");
      } else {
        User user = userOptional.get();
        setUpstreamUserContext(user);
        return null;
        //TODO  role check. api permission check on the specified resource.
      }
    } catch (JwtException e) {
      logger.error("Exception", e);
      return utils.sendForbidden("validation  issue");
    } catch (IOException e) {
      logger.error("Exception", e);
      return utils.sendUnauthorized();
    }
  }
}
