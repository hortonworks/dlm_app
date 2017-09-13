package com.hortonworks.dataplane.gateway.filters;


import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.hortonworks.dataplane.gateway.domain.Constants;
import com.hortonworks.dataplane.gateway.domain.UserContext;
import com.hortonworks.dataplane.gateway.utils.Utils;
import com.netflix.zuul.ZuulFilter;
import com.netflix.zuul.context.RequestContext;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import static org.springframework.cloud.netflix.zuul.filters.support.FilterConstants.PRE_DECORATION_FILTER_ORDER;
import static org.springframework.cloud.netflix.zuul.filters.support.FilterConstants.PRE_TYPE;

@Service
public class UserDetailFilter extends ZuulFilter {
  private static final String USER_DETAIL_ENTRY_POINT = Constants.DPAPP_BASE_PATH + "/auth/userDetail";
  @Autowired
  private Utils utils;

  private ObjectMapper objectMapper = new ObjectMapper();


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
    return utils.getServiceId().equals(Constants.DPAPP) && utils.serlvetPathMatches(USER_DETAIL_ENTRY_POINT);
  }

  @Override
  public Object run() {
    RequestContext ctx = RequestContext.getCurrentContext();
    Object userRefObj = ctx.get(Constants.USER_CTX_KEY);
    if (userRefObj == null) {
      ctx.setResponseStatusCode(200);
      ctx.setResponseBody("{}");
      return null;
    }else{
      try {
        UserContext userContext = (UserContext) userRefObj;
        String userRefJson = objectMapper.writeValueAsString(userContext);
        ctx.setResponseBody(userRefJson);
        ctx.getResponse().addHeader("Cache-Control","no-cache, no-store, max-age=0, must-revalidate");
        ctx.setResponseStatusCode(200);
        ctx.setSendZuulResponse(false);
        return null;
      } catch (JsonProcessingException e) {
        throw new RuntimeException(e);
      }
    }
  }
}