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
package com.hortonworks.dataplane.gateway.config;


import com.fasterxml.jackson.core.JsonProcessingException;
import com.hortonworks.dataplane.gateway.exceptions.GatewayException;
import feign.FeignException;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;
import org.springframework.web.util.WebUtils;

@Order(Ordered.HIGHEST_PRECEDENCE)
@RestControllerAdvice
public class GatewayExceptionHandler extends ResponseEntityExceptionHandler {

  @ExceptionHandler(FeignException.class)
  protected ResponseEntity<Object> handleFeignException(FeignException ex, WebRequest request) {
    logger.warn(ex.getMessage());

    HttpStatus status = ex.status() == 404 ? HttpStatus.UNAUTHORIZED : HttpStatus.valueOf(ex.status());

    request.setAttribute(WebUtils.ERROR_EXCEPTION_ATTRIBUTE, ex, WebRequest.SCOPE_REQUEST);

    return handleExceptionInternal(ex, null, new HttpHeaders(), status, request);
  }

  @ExceptionHandler(JsonProcessingException.class)
  protected ResponseEntity<Object> handleJsonProcessingException(JsonProcessingException ex, WebRequest request) {
    logger.warn(ex.getMessage());

    request.setAttribute(WebUtils.ERROR_EXCEPTION_ATTRIBUTE, ex, WebRequest.SCOPE_REQUEST);

    return handleExceptionInternal(ex, null, new HttpHeaders(), HttpStatus.INTERNAL_SERVER_ERROR, request);
  }

  @ExceptionHandler(GatewayException.class)
  protected ResponseEntity<Object> handleRESTException(GatewayException ex, WebRequest request) {
    logger.warn(ex.getMessage());

    request.setAttribute(WebUtils.ERROR_EXCEPTION_ATTRIBUTE, ex, WebRequest.SCOPE_REQUEST);

    return handleExceptionInternal(ex, null, new HttpHeaders(), HttpStatus.INTERNAL_SERVER_ERROR, request);
  }
}
