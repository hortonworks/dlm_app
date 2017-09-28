/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

import { Observable } from 'rxjs/Observable';
import { Injectable, isDevMode } from '@angular/core';
import { Http, Request, Response, RequestOptionsArgs, RequestOptions, XHRBackend } from '@angular/http';
import { MockResolver } from 'mocks/mock-resolver';
import { API_PREFIX } from 'constants/api.constant';
import { UserService } from 'services/user.service';


@Injectable()
export class HttpService extends Http {
  // prodFlag = true;
  prodFlag = false;

  unauthorizedRedirect = '/unauthorized';
  // todo: add auth token to headers
  // todo: default error handler
  // todo: default data serializer

  private catchErrors() {
    return (response: Response) => {
      if (response.status === 401) {
        window.location.href = UserService.signoutURL;
      } else if (response.status === 403) {
        window.location.href = this.unauthorizedRedirect;
      }
      return Observable.throw(response);
    };
  }

  request(url: string|Request, options?: RequestOptionsArgs): Observable<Response> {
    if (!isDevMode() || this.prodFlag) {
      if (this.prodFlag === true && isDevMode()) {
        return super.request(this.buildUrl(url), options);
      }
      return super.request(this.buildUrl(url), options).catch(this.catchErrors());
    }
    let request;
    const resolver = new MockResolver();
    const prefixed: string|Request = this.buildUrl(url);
    if (typeof prefixed === 'string') {
      request = new Request(new RequestOptions({url: prefixed}));
    } else {
      request = prefixed;
    }
    return super.request(resolver.resolveRequest(request) || prefixed, options);
  }

  buildUrl(url: string|Request): string|Request {
    let apiPrefix = API_PREFIX;
    // Proccess static assets without the api prefix
    const urlString: string = (typeof url === 'string') ? url : (<Request><any>url).url;
    if (urlString.indexOf('assets/') > -1 || urlString.indexOf('http') > -1) {
      apiPrefix = '';
    }
    if (typeof url === 'string') {
      return apiPrefix + url;
    }
    const r: Request = <Request>url;
    r.url = apiPrefix + r.url;
    return r;
  }
}

export function httpFactory(backend: XHRBackend, options: RequestOptions) {
  return new HttpService(backend, options);
}

export const httpServiceProvider = {
  provide: Http,
  useFactory: httpFactory,
  deps: [XHRBackend, RequestOptions]
};
