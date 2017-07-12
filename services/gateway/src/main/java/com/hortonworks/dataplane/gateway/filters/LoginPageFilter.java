package com.hortonworks.dataplane.gateway.filters;

import com.hortonworks.dataplane.gateway.domain.Constants;
import com.hortonworks.dataplane.gateway.service.ConfigurationService;
import com.hortonworks.dataplane.gateway.utils.KnoxSso;
import com.netflix.zuul.ZuulFilter;
import com.netflix.zuul.context.RequestContext;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.IOException;

import static org.springframework.cloud.netflix.zuul.filters.support.FilterConstants.PRE_DECORATION_FILTER_ORDER;
import static org.springframework.cloud.netflix.zuul.filters.support.FilterConstants.PRE_TYPE;
import static org.springframework.cloud.netflix.zuul.filters.support.FilterConstants.SERVICE_ID_KEY;

@Service
public class LoginPageFilter extends ZuulFilter {
  private static final String LOGIN_ENTRY_POINT = Constants.DPAPP_BASE_PATH+"/login";

  @Autowired
  private ConfigurationService configurationService;


  @Autowired
  private KnoxSso knoxSso;

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
    return serviceId.equals(Constants.DPAPP) && ctx.getRequest().getServletPath().equals(LOGIN_ENTRY_POINT);
  }

  @Override
  public Object run() {
    RequestContext ctx = RequestContext.getCurrentContext();
    Object userObj = RequestContext.getCurrentContext().get(Constants.USER_CTX_KEY);
    if (userObj!=null){
      //user is already logged in.
      try {
        ctx.getResponse().sendRedirect("/");
      } catch (IOException e) {
        throw new RuntimeException(e);
      }
    }
    String landingPage=ctx.getRequest().getParameter("landingPage");
    if (configurationService.isLdapConfigured()){
      String knoxRedirectUrl=knoxSso.getLoginUrl(landingPage);
      try {
        ctx.getResponse().sendRedirect(knoxRedirectUrl);
      } catch (IOException e) {
        throw new RuntimeException(e);
      }
    }else{
      String signInUrl=ctx.getRequest().getParameter("signInUrl");
      try {
        ctx.getResponse().sendRedirect(String.format("%s/%s",landingPage,signInUrl));
      } catch (IOException e) {
        throw new RuntimeException(e);
      }
    }
    return null;
  }
}
