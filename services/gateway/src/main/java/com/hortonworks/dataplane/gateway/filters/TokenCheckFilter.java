package com.hortonworks.dataplane.gateway.filters;


import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.google.common.base.Optional;
import com.hortonworks.dataplane.gateway.domain.*;
import com.hortonworks.dataplane.gateway.utils.Jwt;
import com.hortonworks.dataplane.gateway.service.UserService;
import com.hortonworks.dataplane.gateway.utils.CookieManager;
import com.hortonworks.dataplane.gateway.utils.KnoxSso;
import com.hortonworks.dataplane.gateway.utils.RequestResponseUtils;
import com.hortonworks.dataplane.gateway.utils.Utils;
import com.netflix.zuul.ZuulFilter;
import com.netflix.zuul.context.RequestContext;
import feign.FeignException;
import io.jsonwebtoken.JwtException;
import org.apache.commons.codec.binary.Base64;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;

import org.springframework.stereotype.Service;

import javax.servlet.http.Cookie;
import java.io.IOException;

import static com.hortonworks.dataplane.gateway.domain.Constants.*;
import static org.springframework.cloud.netflix.zuul.filters.support.FilterConstants.*;

@Service
public class TokenCheckFilter extends ZuulFilter {
  private static final Logger logger = LoggerFactory.getLogger(TokenCheckFilter.class);
  private static final String AUTH_ENTRY_POINT = Constants.DPAPP_BASE_PATH+"/auth/in";
  private static final String KNOX_CONFIG_PATH = Constants.DPAPP_BASE_PATH+"/api/knox/configuration";
  private static final String LOGIN_POINT = Constants.DPAPP_BASE_PATH + "/login";

  @Autowired
  private UserService userService;

  @Autowired
  private KnoxSso knoxSso;

  @Autowired
  private Utils utils;

  @Autowired
  private Jwt jwt;

  @Autowired
  private CookieManager cookieManager;

  @Autowired
  private RequestResponseUtils requestResponseUtils;

  @Autowired
  private ServicesConfigUtil servicesConfigUtil;

  private ObjectMapper objectMapper = new ObjectMapper();


  @Override
  public String filterType() {
    return PRE_TYPE;
  }


  @Override
  public int filterOrder() {
    return PRE_DECORATION_FILTER_ORDER + 1;
  }


  @Override
  public boolean shouldFilter() {
    RequestContext ctx = RequestContext.getCurrentContext();
    String serviceId = ctx.get(SERVICE_ID_KEY).toString();
    // Check if its not a sign in call - Protect everything else

    //TODO remvoe Knox config path once secret key mechanism is established.
    return (serviceId.equals(Constants.DPAPP) || serviceId.equals(Constants.DLMAPP)) &&
      !(ctx.getRequest().getServletPath().equals(AUTH_ENTRY_POINT)
      || ctx.getRequest().getServletPath().equals(KNOX_CONFIG_PATH)

      );

  }

  @Override
  public Object run() {
    if (isSsoLoginPath()) {
      requestResponseUtils.redirectToKnoxLogin();
      return null;
    } else if (isLogoutPath()) {
      return doLogout();
    } else {
      Optional<String> bearerToken=BEARER_TOKEN_IN_COOKIE?cookieManager.getDataplaneJwtCookie():utils.getBearerTokenFromHeader();
      if (bearerToken.isPresent()) {
        utils.deleteAuthorizationHeaderToUpstream();
        return authorizeThroughDPToken(bearerToken);
      } else if (knoxSso.isSsoConfigured()) {
        return authorizeThroughSsoToken();
      } else {  //TODO validate knox sso.
        return utils.sendForbidden(null);
      }
    }
  }


  private Object doLogout() {
    //TODO call knox gateway to invalidate token in knox gateway server.

    cookieManager.deleteKnoxSsoCookie();
    cookieManager.deleteDataplaneJwtCookie();
    requestResponseUtils.redirectToLogin();

    //Note. UI should handle redirect.
    return null;
  }

  private Object authorizeThroughSsoToken() {
    Optional<Cookie> knoxSsoCookie = cookieManager.getKnoxSsoCookie();
    if (!knoxSsoCookie.isPresent()) {
      return handleUnAuthorized(null);
    }
    String knoxSsoCookieValue = knoxSsoCookie.get().getValue();
    TokenInfo tokenInfo = knoxSso.validateJwt(knoxSsoCookieValue);
    if (!tokenInfo.isValid()) {
      return handleUnAuthorized(null);
    }
    try {
      Optional<UserContext> userContextFromDb = userService.getUserContext(tokenInfo.getSubject());
      if (!userContextFromDb.isPresent()) {
        try {
          UserContext userContext = userService.syncUserFromLdapGroupsConfiguration(tokenInfo.getSubject());
          if (userContext != null) {
            setupUserSession(tokenInfo, userContext);
            return null;
          } else {
            return utils.sendForbidden(utils.getUserNotFoundErrorMsg(tokenInfo.getSubject()));
          }
        }catch (NoAllowedGroupsException nge){
          return utils.sendForbidden(utils.getGroupNotFoundErrorMsg(tokenInfo.getSubject()));
        }
      } else {
        if (userContextFromDb.get().isActive()){
          setupUserSession(tokenInfo, userContextFromDb.get());
          return null;
        }else{
          return utils.sendForbidden(utils.getInactiveErrorMsg(tokenInfo.getSubject()));
        }
      }
    } catch (FeignException e) {
      throw new RuntimeException(e);
    }
  }

  private void setupUserSession(TokenInfo tokenInfo, UserContext userContext) {
    addDpJwtToken(tokenInfo, userContext);
    setUpstreamUserContext(userContext);
    setUpstreamKnoxTokenContext();
    RequestContext.getCurrentContext().set(Constants.USER_CTX_KEY,userContext);
  }

  private void addDpJwtToken(TokenInfo tokenInfo, UserContext userContext) {
    try {
      String jwtToken = jwt.makeJWT(userContext);
      userContext.setToken(jwtToken);
      cookieManager.addDataplaneJwtCookie(jwtToken,tokenInfo.getExpiryTime());
    } catch (JsonProcessingException e) {
      throw new RuntimeException(e);
    }
  }

  private boolean isSsoLoginPath() {
    RequestContext ctx = RequestContext.getCurrentContext();
    return KNOX_LOGIN_PATH.equals(ctx.getRequest().getServletPath());
  }
  private boolean isLogoutPath() {
    RequestContext ctx = RequestContext.getCurrentContext();
    return LOGOUT_PATH.equals(ctx.getRequest().getServletPath());
  }

  private void setUpstreamUserContext(UserContext userContext) {
    RequestContext ctx = RequestContext.getCurrentContext();
    try {
      String userJson = objectMapper.writeValueAsString(userContext);
      ctx.addZuulRequestHeader(DP_USER_INFO_HEADER_KEY, Base64.encodeBase64String(userJson.getBytes()));
    } catch (JsonProcessingException e) {
      throw new RuntimeException(e);
    }
  }

  private void setUpstreamKnoxTokenContext() {
    Optional<Cookie> knoxSsoCookie = cookieManager.getKnoxSsoCookie();
    if (knoxSsoCookie.isPresent()) {
      RequestContext ctx = RequestContext.getCurrentContext();
      ctx.addZuulRequestHeader(DP_TOKEN_INFO_HEADER_KEY, knoxSsoCookie.get().getValue());
    }
  }

  private Object authorizeThroughDPToken(Optional<String> bearerToken) {
    try {
      Optional<UserContext> userContextOptional = jwt.parseJWT(bearerToken.get());
      if (!userContextOptional.isPresent()) {
        cookieManager.deleteDataplaneJwtCookie();
        return handleUnAuthorized("DP_JWT_COOKIE has expired or not valid");
      } else {
        UserContext userContext = userContextOptional.get();
        if (userContext.isActive()){
          if (servicesConfigUtil.isRouteAllowed(userContext.getServices())){
            setUpstreamUserContext(userContext);
            setUpstreamKnoxTokenContext();
            RequestContext.getCurrentContext().set(Constants.USER_CTX_KEY, userContext);
            return null;
          }else{
            return utils.sendForbidden("dont have access to this resource");
          }
        }else{
          return utils.sendForbidden(utils.getInactiveErrorMsg(userContext.getUsername()));
        }
      }
    } catch (JwtException e) {
      logger.error("Exception", e);
      return utils.sendForbidden("validation  issue");
    } catch (IOException e) {
      logger.error("Exception", e);
      return utils.sendUnauthorized();
    }
  }

  private Object handleUnAuthorized(String reason) {
    if (!requestResponseUtils.isLoginPath()){
      return utils.sendUnauthorized(reason);
    }else{
      return  null;//Login would be handled in next filters.
    }
  }
}