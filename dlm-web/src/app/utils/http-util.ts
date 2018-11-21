/*
 * HORTONWORKS DATAPLANE SERVICE AND ITS CONSTITUENT SERVICES
 *
 * (c) 2016-2018 Hortonworks, Inc. All rights reserved.
 *
 * This code is provided to you pursuant to your written agreement with Hortonworks, which may be the terms
 * of the Affero General Public License version 3 (AGPLv3), or pursuant to a written agreement with a third party
 * authorized to distribute this code.  If you do not have a written agreement with Hortonworks or with
 * an authorized and properly licensed third party, you do not have any rights to this code.
 *
 * If this code is provided to you under the terms of the AGPLv3: A) HORTONWORKS PROVIDES THIS CODE TO YOU
 * WITHOUT WARRANTIES OF ANY KIND; (B) HORTONWORKS DISCLAIMS ANY AND ALL EXPRESS AND IMPLIED WARRANTIES WITH
 * RESPECT TO THIS CODE, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF TITLE, NON-INFRINGEMENT, MERCHANTABILITY
 * AND FITNESS FOR A PARTICULAR PURPOSE; (C) HORTONWORKS IS NOT LIABLE TO YOU, AND WILL NOT DEFEND, INDEMNIFY,
 * OR HOLD YOU HARMLESS FOR ANY CLAIMS ARISING FROM OR RELATED TO THE CODE; AND (D) WITH RESPECT
 * TO YOUR EXERCISE OF ANY RIGHTS GRANTED TO YOU FOR THE CODE, HORTONWORKS IS NOT LIABLE FOR ANY DIRECT,
 * INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, PUNITIVE OR CONSEQUENTIAL DAMAGES INCLUDING, BUT NOT LIMITED TO,
 * DAMAGES RELATED TO LOST REVENUE, LOST PROFITS, LOSS OF INCOME, LOSS OF BUSINESS ADVANTAGE OR UNAVAILABILITY,
 * OR LOSS OR CORRUPTION OF DATA.
 */

import {HttpHeaders, HttpParams, HttpErrorResponse, HttpClient} from '@angular/common/http';
import { APIError, APIErrors, APIErrorDetails } from 'models/error.model';
import {isDevMode} from '@angular/core';
import {Observable} from 'rxjs';

const unknown = 'Something went wrong.';

export const getHeaders = (): HttpHeaders => {
  const headers = {
    'Content-Type': 'application/json',
    'X-Requested-With' : 'XMLHttpRequest'
  };
  return new HttpHeaders(headers);
};

export const getError = (errResponse: HttpErrorResponse): APIErrorDetails => {
  const message = (errResponse.error.message || unknown).replace('Failed with ', '');
  let errors: APIError[];
  try {
    const apiResponse = JSON.parse(message);
    const apiErrors: APIErrors = 'error' in apiResponse ? {errors: [apiResponse as APIError]} as APIErrors :
      ('errors' in apiResponse) ? apiResponse as APIErrors : {errors: [{error: {message: apiResponse.message}} as APIError]} as APIErrors;
    errors = apiErrors.errors;
  } catch (e) {
    errors = [{error: { message } as APIErrorDetails } as APIError];
  }
  return errors[0].error;
};


export const getUrlDomain = (urlAddress: string): string => {
  let url: URL|string = urlAddress;
  try {
    url = new URL(url);
    url = `${url.protocol}//${url.host}`;
  } catch (e) {}
  return url;
};

/**
 * Get absolute URL prefix required to access Dataplane API
 * @returns {string}
 */
export const getUrlPrefix = (): string => {
  const protocol = window.location.protocol;
  const host = window.location.hostname;
  let port = window.location.port;
  port = port ? ':' + port : '';
  return protocol + '//' + host + port;
};

/**
 * Get observable for Dataplane api request
 * @param {HttpClient} httpClient
 * @param {string} apiPath
 * @returns {Observable<any>}
 */
export const getDataplaneApi = (httpClient: HttpClient, apiPath: string): Observable<any> => {
  const urlPrefix = getUrlPrefix();
  if (!isDevMode()) {
    return httpClient.get<any>([urlPrefix, apiPath].join('/'), { headers: getHeaders() });
  }
  // Get mock response
  return httpClient.get<any>(apiPath);
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
