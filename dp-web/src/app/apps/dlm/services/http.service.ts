import { Observable } from 'rxjs/Observable';
import { Injectable, isDevMode } from '@angular/core';
import { Http, Request, Response, RequestOptionsArgs, RequestOptions, XHRBackend } from '@angular/http';
import { MockResolver } from '../mocks/mock-resolver';


@Injectable()
export class HttpService extends Http {
  apiPrefix: string = '/api/dlm/';

  // todo: add auth token to headers
  // todo: default error handler
  // todo: default data serializer
  request(url: string|Request, options?: RequestOptionsArgs): Observable<Response> {
    if (!isDevMode()) {
      return super.request(this.buildUrl(url), options);
    }
    let request;
    let resolver = new MockResolver();
    let prefixed: string|Request = this.buildUrl(url);
    if (typeof prefixed === 'string') {
      request = new Request(new RequestOptions({url: prefixed}));
    } else {
      request = prefixed;
    }
    return super.request(resolver.resolveRequest(request) || prefixed, options);
  }

  buildUrl(url: string|Request): string|Request {
    if (typeof url === 'string') {
      return this.apiPrefix + url;
    }
    let r: Request = url;
    r.url = this.apiPrefix + r.url;
    return r;
  }
}

export function httpFactory(backend: XHRBackend, options: RequestOptions) {
  return new HttpService(backend, options);
};

export const httpServiceProvider = {
  provide: Http,
  useFactory: httpFactory,
  deps: [XHRBackend, RequestOptions]
}
