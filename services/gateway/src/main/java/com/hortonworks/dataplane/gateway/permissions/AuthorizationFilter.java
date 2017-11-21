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
package com.hortonworks.dataplane.gateway.permissions;

import com.hortonworks.dataplane.gateway.domain.Constants;
import com.hortonworks.dataplane.gateway.domain.UserContext;
import com.hortonworks.dataplane.gateway.utils.Utils;
import com.netflix.zuul.ZuulFilter;
import com.netflix.zuul.context.RequestContext;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.cloud.netflix.zuul.filters.Route;
import org.springframework.cloud.netflix.zuul.filters.RouteLocator;
import org.springframework.stereotype.Service;

import static org.springframework.cloud.netflix.zuul.filters.support.FilterConstants.PRE_DECORATION_FILTER_ORDER;
import static org.springframework.cloud.netflix.zuul.filters.support.FilterConstants.PRE_TYPE;
import static org.springframework.cloud.netflix.zuul.filters.support.FilterConstants.SERVICE_ID_KEY;

@Service
public class AuthorizationFilter extends ZuulFilter {
  private static final Logger logger = LoggerFactory.getLogger(AuthorizationFilter.class);

  @Autowired
  private PermPoliciesService permPoliciesService;

  @Autowired
  private Utils utils;

  @Autowired
  private RouteLocator routeLocator;

  @Override
  public String filterType() {
    return PRE_TYPE;
  }

  @Override
  public int filterOrder() {
    return PRE_DECORATION_FILTER_ORDER + 10;
  }

  @Override
  public boolean shouldFilter() {
    RequestContext ctx = RequestContext.getCurrentContext();
    String serviceId = getServiceId();
    if (ctx.get(Constants.ABORT_FILTER_CHAIN)!=null && Boolean.TRUE.equals(ctx.get(Constants.ABORT_FILTER_CHAIN))){
      logger.info("Repsonse already commited. hence ignoring Authorization filter");
      return false;
    }
    return permPoliciesService.hasPolicy(serviceId);
  }

  @Override
  public Object run() {
    RequestContext ctx = RequestContext.getCurrentContext();
    Route matchingRoute = this.routeLocator.getMatchingRoute(ctx.getRequest().getServletPath());
    if (matchingRoute!=null){
      String path=matchingRoute.getPath();
      UserContext userContext = (UserContext) RequestContext.getCurrentContext().get(Constants.USER_CTX_KEY);
      String[] rolesArr = ((userContext == null || userContext.getRoles() == null || userContext.getRoles().isEmpty()) ? new String[]{} : userContext.getRoles().toArray(new String[0]));
      boolean isAuthorized = permPoliciesService.isAuthorized(getServiceId(),ctx.getRequest().getMethod(),path,rolesArr );
      if (isAuthorized) {
        return null;
      } else {
        return utils.sendForbidden("No permission for this resource");
      }
    }else{
      logger.error(String.format("no matching route found for [$s]",ctx.getRequest().getServletPath()));
      return  null;//currently proceeding
    }

  }

  private String getServiceId() {
    RequestContext ctx = RequestContext.getCurrentContext();
    return ctx.get(SERVICE_ID_KEY).toString();
  }
}
