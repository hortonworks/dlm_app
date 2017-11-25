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

package com.hortonworks.dataplane.gateway.exceptions;

import com.netflix.zuul.exception.ZuulException;
import org.springframework.cloud.netflix.zuul.util.ZuulRuntimeException;
import org.springframework.http.HttpStatus;

import javax.servlet.http.HttpServletResponse;

public class GatewayException extends ZuulRuntimeException {

  public GatewayException(HttpStatus status, String message) {
    super(new ZuulException("Gateway exception", status.value(), message));
  }

  public GatewayException(Throwable throwable, HttpStatus status, String message) {
    super(new ZuulException(throwable, "Gateway exception", status.value(), message));
  }

  public HttpStatus getStatus() {
    ZuulException exception = findZuulException(this);
    return HttpStatus.valueOf(exception.nStatusCode);
  }

  private ZuulException findZuulException(Throwable throwable) {
    if (throwable.getCause() instanceof ZuulRuntimeException) {
      // this was a failure initiated by one of the local filters
      return (ZuulException) throwable.getCause().getCause();
    }

    if (throwable.getCause() instanceof ZuulException) {
      // wrapped zuul exception
      return (ZuulException) throwable.getCause();
    }

    if (throwable instanceof ZuulException) {
      // exception thrown by zuul lifecycle
      return (ZuulException) throwable;
    }

    // fallback, should never get here
    return new ZuulException(throwable, HttpServletResponse.SC_INTERNAL_SERVER_ERROR, null);
  }
}
