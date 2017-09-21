package com.hortonworks.dataplane.gateway.permissions;

import com.hortonworks.dataplane.gateway.domain.Constants;
import com.hortonworks.dataplane.gateway.domain.UserContext;
import com.hortonworks.dataplane.gateway.permissions.PermPoliciesService;
import com.hortonworks.dataplane.gateway.utils.Utils;
import com.netflix.zuul.ZuulFilter;
import com.netflix.zuul.context.RequestContext;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import static org.springframework.cloud.netflix.zuul.filters.support.FilterConstants.PRE_TYPE;
import static org.springframework.cloud.netflix.zuul.filters.support.FilterConstants.SERVICE_ID_KEY;

//@Service
public class AuthorizationFilter extends ZuulFilter {

  @Autowired
  private PermPoliciesService permPoliciesService;

  @Autowired
  private Utils utils;

  @Override
  public String filterType() {
    return PRE_TYPE;
  }

  @Override
  public int filterOrder() {
    return 0;
  }

  @Override
  public boolean shouldFilter() {
    String serviceId = getServiceId();
    return permPoliciesService.hasPolicy(serviceId);
  }

  @Override
  public Object run() {
//    UserContext userContext = (UserContext) RequestContext.getCurrentContext().get(Constants.USER_CTX_KEY);
////    boolean isAuthorized = permPoliciesService.isAuthorized(getServiceId(), RequestContext.getCurrentContext().getRequest(), String[]userContext.getRoles().toArray());
//    if (isAuthorized) {
//      return null;
//    } else {
//      return utils.sendUnauthorized();
//    }
    return null;
  }

  private String getServiceId() {
    RequestContext ctx = RequestContext.getCurrentContext();
    return ctx.get(SERVICE_ID_KEY).toString();
  }
}
