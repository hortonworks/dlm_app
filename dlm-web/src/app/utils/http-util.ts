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

import { HttpHeaders, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { User } from 'models/user.model';
import { TranslateService } from '@ngx-translate/core';
import { APIError, APIErrorDetails } from 'models/error.model';

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
