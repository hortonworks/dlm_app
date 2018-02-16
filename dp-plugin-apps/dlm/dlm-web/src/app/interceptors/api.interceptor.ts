/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpEvent, HttpHandler, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { API_PREFIX } from 'constants/api.constant';

@Injectable()
export class ApiInterceptor implements HttpInterceptor {

  buildUrl(url: string): string {
    let apiPrefix = API_PREFIX;
    // Process static assets without the api prefix
    if (url.indexOf('assets/') > -1 || url.indexOf('http') > -1) {
      apiPrefix = '';
    }
    return apiPrefix + url;
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const request = req.clone({url: this.buildUrl(req.url)});
    return next.handle(request);
  }
}
