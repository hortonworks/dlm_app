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
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.util.StreamUtils;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStream;

import static org.springframework.cloud.netflix.zuul.filters.support.FilterConstants.POST_TYPE;
import static org.springframework.util.ReflectionUtils.rethrowRuntimeException;


/**
 * This filter logs API calls and responses across
 * all services which return a 500
 */
@Service
public class TraceFilter extends ZuulFilter {

  private static final int NINE_NINETY_NINE = 999;
  private static Logger log = LoggerFactory.getLogger(TraceFilter.class);

  @Override
  public String filterType() {
    return POST_TYPE;
  }


  @Override
  public int filterOrder() {
    return NINE_NINETY_NINE;
  }

  /**
   * @return True if 500 response
   */
  @Override
  public boolean shouldFilter() {
    RequestContext ctx = RequestContext.getCurrentContext();
    return ctx.getResponseStatusCode() == 500;
  }

  /**
   * In case the API request returned a Http 500
   * log the response by copying the body
   *
   */
  @Override
  public Object run() {
    log.info("Logging API response");
    RequestContext ctx = RequestContext.getCurrentContext();
    log.warn("Request path :" + ctx.getRequest().getServletPath());
    try {
      InputStream stream = ctx.getResponseDataStream();
      byte[] body = null;
      if (stream != null) {
        body = StreamUtils.copyToByteArray(stream);
        log.warn("Dumping response body");
        log.warn(new String(body));
      }
      if (body != null) {
        ctx.setResponseDataStream(new ByteArrayInputStream(body));
      }
    } catch (IOException e) {
      rethrowRuntimeException(e);
    }
    return null;
  }
}
