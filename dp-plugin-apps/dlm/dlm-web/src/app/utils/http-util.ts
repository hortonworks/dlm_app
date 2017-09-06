/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

import { Response, RequestOptionsArgs, Headers, URLSearchParams } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { User } from 'models/user.model';
import { TranslateService } from '@ngx-translate/core';

export const toJson = (response: Response) => response.json();
export const mapResponse = (response$: Observable<Response>) => response$.map(toJson);

export const getHeaders = (): RequestOptionsArgs => {
  const headers = {
    'Content-Type': 'application/json',
  };
  return ({
    headers: new Headers(headers)
  });
};

export const getError = (response) => {
  const message = (response.message || 'common.errors.unknown').replace('Failed with ', '');
  let error;
  try {
    error = JSON.parse(message).error;
  } catch (e) {
    error = message;
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

export const toSearchParams = (queryParams = {}): URLSearchParams => {
  const params = new URLSearchParams();
  for (const param in queryParams) {
    if (param && queryParams.hasOwnProperty(param)) {
      params.set(param, queryParams[param]);
    }
  }
  return params;
};
