/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

import { HttpHeaders, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { User } from 'models/user.model';
import { TranslateService } from '@ngx-translate/core';
import { APIError, APIErrorDetails } from 'models/error.model';

export const getHeaders = (): HttpHeaders => {
  const headers = {
    'Content-Type': 'application/json',
    'X-Requested-With' : 'XMLHttpRequest'
  };
  return new HttpHeaders(headers);
};

export const getError = (errResponse: HttpErrorResponse): APIErrorDetails => {
  const message = (errResponse.error.message || 'common.errors.unknown').replace('Failed with ', '');
  let error;
  try {
    const apiError = JSON.parse(message) as APIError;
    error = 'error' in apiError ? apiError.error : apiError;
  } catch (e) {
    error = { message };
  }
  return error;
};


export const getUrlDomain = (urlAddress: string): string => {
  let url: URL|string = urlAddress;
  try {
    url = new URL(url);
    url = `${url.protocol}//${url.host}`;
  } catch (e) {}
  return url;
};

export const toSearchParams = (queryParams: {[param: string]: any}): HttpParams => {
  let params = new HttpParams();
  Object.keys(queryParams || {}).forEach(param => {
    let value = queryParams[param];
    if (typeof value !== 'string') {
      value = JSON.stringify(value);
    }
    params = params.set(param, value);
  });
  return params;
};
