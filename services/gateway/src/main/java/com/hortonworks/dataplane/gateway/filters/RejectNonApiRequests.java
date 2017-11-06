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


import com.netflix.zuul.ZuulFilter;
import com.netflix.zuul.context.RequestContext;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import static org.springframework.cloud.netflix.zuul.filters.support.FilterConstants.*;

/**
 * Rejects all requests which do not begin with /api/**
 */
@Service
public class RejectNonApiRequests extends ZuulFilter {

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
    return !ctx.getRequest().getServletPath().startsWith("/api");
  }


  @Override
  public Object run() {
    RequestContext ctx = RequestContext.getCurrentContext();
    ctx.setResponseStatusCode(403);
    ctx.setSendZuulResponse(false);
    throw new RuntimeException("Request not allowed");
  }
}
