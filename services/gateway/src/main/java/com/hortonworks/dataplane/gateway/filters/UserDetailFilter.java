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
    return PRE_DECORATION_FILTER_ORDER + 20;
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
        userContext.setPassword("");
        String userRefJson = objectMapper.writeValueAsString(userContext);
        ctx.setResponseBody(userRefJson);
        utils.addNoCacheHeaders(ctx.getResponse());
        ctx.setResponseStatusCode(200);
        ctx.setSendZuulResponse(false);
        return null;
      } catch (JsonProcessingException e) {
        throw new RuntimeException(e);
      }
    }
  }
}