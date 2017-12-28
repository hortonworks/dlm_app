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
import { UserService } from 'services/user.service';
import { AppConfig } from 'app.config';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private unauthorizedRedirect = '/unauthorized';

  constructor(private appConfig: AppConfig) {}

  private catchErrors() {
    return (response: Response) => {
      if (response.status === 401) {
        const challengeAt = response.headers.get(UserService.HEADER_CHALLENGE_HREF);
        const redirectTo = `${window.location.protocol}//${window.location.host}/${challengeAt}`;
        if (window.location.href.startsWith(redirectTo) === false) {
          window.location.href = `${redirectTo}?originalUrl=${window.location.href}`;
        }
      } else if (response.status === 403) {
        window.location.href = this.unauthorizedRedirect;
      }
      return Observable.throw(response);
    };
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // disable redirect when app runs dev mode
    if (isDevMode()) {
      return next.handle(req);
    }
    return next.handle(req).catch(this.catchErrors());
  }
}
