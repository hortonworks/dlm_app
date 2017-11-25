package com.hortonworks.dataplane.gateway.filters;

import com.google.common.base.Optional;
import com.hortonworks.dataplane.gateway.domain.Constants;
import com.hortonworks.dataplane.gateway.domain.NoAllowedGroupsException;
import com.hortonworks.dataplane.gateway.domain.TokenInfo;
import com.hortonworks.dataplane.gateway.domain.UserContext;
import com.hortonworks.dataplane.gateway.exceptions.GatewayException;
import com.hortonworks.dataplane.gateway.service.UserService;
import com.hortonworks.dataplane.gateway.utils.CookieUtils;
import com.hortonworks.dataplane.gateway.utils.KnoxSso;
import com.netflix.zuul.ZuulFilter;
import com.netflix.zuul.context.RequestContext;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import static org.springframework.cloud.netflix.zuul.filters.support.FilterConstants.PRE_DECORATION_FILTER_ORDER;
import static org.springframework.cloud.netflix.zuul.filters.support.FilterConstants.PRE_TYPE;


@Service
public class KnoxAuthAndSyncPreFilter extends ZuulFilter {
  private static final Logger logger = LoggerFactory.getLogger(KnoxAuthAndSyncPreFilter.class);


  @Autowired
  private KnoxSso knox;

  @Autowired
  private UserService userService;

  @Autowired
  private CookieUtils cookieUtils;

  private static final Long MILLISECONDS_IN_1_MINUTE = 1L * 60 * 1000;

  @Value("${ldap.groups.resync.interval.minutes}")
  private Long ldapResyncInterval;

  @Override
  public String filterType() {
    return PRE_TYPE;
  }

  @Override
  public int filterOrder() {
    return PRE_DECORATION_FILTER_ORDER + 4;
  }

  @Override
  public boolean shouldFilter() {
    RequestContext context = RequestContext.getCurrentContext();
    String knoxToken = cookieUtils.getKnoxToken();

    return context.get(Constants.USER_CTX_KEY) == null && knoxToken != null;
  }

  @Override
  public Object run() {

    String knoxToken = cookieUtils.getKnoxToken();
    UserContext userContext = buildSyncedUserContextFromKnoxToken(knoxToken);

    RequestContext context = RequestContext.getCurrentContext();
    context.set(Constants.USER_CTX_KEY, userContext);

    return null;
  }


  private UserContext buildSyncedUserContextFromKnoxToken(String token) throws GatewayException {
    UserContext userContext = null;
    TokenInfo tokenInfo = knox.validateJwt(token);

    if (!tokenInfo.isValid()) {
      throw new GatewayException(HttpStatus.UNAUTHORIZED, "Knox token is invalid.");
    }

    Optional<UserContext> userContextFromDb = userService.getUserContext(tokenInfo.getSubject());
    if (!userContextFromDb.isPresent()) {

      try {
        userContext = userService.syncUserFromLdapGroupsConfiguration(tokenInfo.getSubject());
        if (userContext == null) {
          throw new GatewayException(HttpStatus.FORBIDDEN, "User does not have access to DPS.");
        }
      } catch (NoAllowedGroupsException nge){
        throw new GatewayException(HttpStatus.FORBIDDEN, "User does not have access to DPS. No groups have been configured.");
      }

    } else {

      userContext = userContextFromDb.get();

      if (!userContext.isActive()) {
        throw new GatewayException(HttpStatus.FORBIDDEN, "User has been marked inactive.");
      }

      if (needsResyncFromLdap(userContext)) {
        logger.info(String.format("resyncing from ldap for user [%s]", tokenInfo.getSubject()));
        userContext = userService.resyncUserFromLdapGroupsConfiguration(tokenInfo.getSubject());
        if(userContext == null) {
          throw new GatewayException(HttpStatus.INTERNAL_SERVER_ERROR, "Unable to resync user with LDAP.");
        }
        logger.info(("resync complete"));
      }
    }

    return userContext;
  }

  private boolean needsResyncFromLdap(UserContext userContextFromDb) {
    return userContextFromDb.isGroupManaged() && System.currentTimeMillis() - userContextFromDb.getUpdatedAt() > ldapResyncInterval * MILLISECONDS_IN_1_MINUTE;
  }
}
