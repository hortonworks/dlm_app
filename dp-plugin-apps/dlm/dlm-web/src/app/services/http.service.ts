import { Observable } from 'rxjs/Observable';
import { Injectable, isDevMode } from '@angular/core';
import { Http, Request, Response, RequestOptionsArgs, RequestOptions, XHRBackend } from '@angular/http';
import { MockResolver } from 'mocks/mock-resolver';


@Injectable()
export class HttpService extends Http {
  apiPrefix = '/api/';
  prodFlag = false;

  // todo: add auth token to headers
  // todo: default error handler
  // todo: default data serializer
  request(url: string|Request, options?: RequestOptionsArgs): Observable<Response> {
    this.apiPrefix = '/api/';
    // Proccess static assets without the api prefix
    const urlString: string = (typeof url === 'string') ? url : (<Request><any>url).url;
    if (urlString.indexOf('assets/') > -1) {
      this.apiPrefix = '';
    }
    if (!isDevMode() || this.prodFlag) {
      return super.request(this.buildUrl(url), options);
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
    if (typeof url === 'string') {
      return this.apiPrefix + url;
    }
    const r: Request = <Request>url;
    r.url = this.apiPrefix + r.url;
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
