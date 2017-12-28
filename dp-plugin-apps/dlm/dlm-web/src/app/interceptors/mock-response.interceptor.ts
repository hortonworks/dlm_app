/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

import { Injectable, isDevMode } from '@angular/core';
import { HttpInterceptor, HttpEvent, HttpHandler, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';

import { MockResolver } from 'mocks/mock-resolver';
import { AppConfig } from 'app.config';

@Injectable()
export class MockResponseInterceptor implements HttpInterceptor {

  constructor(private appConfig: AppConfig) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (!isDevMode() || this.appConfig.prodMode) {
      if (this.appConfig.prodMode && isDevMode()) {
        return next.handle(req);
      }
      return next.handle(req);
    }
    const resolver = new MockResolver();
    const mockedRequest = req.clone(resolver.resolveRequest(req));
    return next.handle(mockedRequest);
  }
}
