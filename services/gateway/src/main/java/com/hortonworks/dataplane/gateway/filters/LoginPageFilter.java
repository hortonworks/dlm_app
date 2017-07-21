package com.hortonworks.dataplane.gateway.filters;

import com.hortonworks.dataplane.gateway.domain.Constants;
import com.hortonworks.dataplane.gateway.service.ConfigurationService;
import com.hortonworks.dataplane.gateway.utils.RequestResponseUtils;
import com.netflix.zuul.ZuulFilter;
import com.netflix.zuul.context.RequestContext;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import static org.springframework.cloud.netflix.zuul.filters.support.FilterConstants.PRE_DECORATION_FILTER_ORDER;
import static org.springframework.cloud.netflix.zuul.filters.support.FilterConstants.PRE_TYPE;
import static org.springframework.cloud.netflix.zuul.filters.support.FilterConstants.SERVICE_ID_KEY;

@Service
public class LoginPageFilter extends ZuulFilter {

  @Autowired
  private ConfigurationService configurationService;

  @Autowired
  private RequestResponseUtils requestResponseUtils;

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
    RequestContext ctx = RequestContext.getCurrentContext();
    String serviceId = ctx.get(SERVICE_ID_KEY).toString();
    return serviceId.equals(Constants.DPAPP) && ctx.getRequest().getServletPath().equals(Constants.LOGIN_ENTRY_POINT);
  }

  @Override
  public Object run() {
    RequestContext ctx = RequestContext.getCurrentContext();
    Object userRefObj = RequestContext.getCurrentContext().get(Constants.USER_CTX_KEY);
    if (userRefObj!=null){
      //user is already logged in.
      requestResponseUtils.redirectToRoot();
      return null;
    }
    if (configurationService.isLdapConfigured()){
      requestResponseUtils.redirectToKnoxLogin();
      return null;
    }else{
      requestResponseUtils.redirectToLocalSignin();
    }
    return null;
  }
}
