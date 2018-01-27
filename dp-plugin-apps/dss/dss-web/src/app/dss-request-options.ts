import { Injectable, isDevMode } from '@angular/core';
import { BaseRequestOptions, RequestOptions, RequestOptionsArgs } from '@angular/http';
import {dssCoreURLS} from './shared/utils/constants';

@Injectable()
export class BaseDssRequestOptions extends BaseRequestOptions {
  merge(options?:RequestOptionsArgs):RequestOptions {
    return new DssRequestOptions(super.merge(extracted(options)));
  }
}

export class DssRequestOptions extends RequestOptions {
  merge(options?: RequestOptionsArgs): RequestOptions {
    return new RequestOptions(super.merge(extracted(options)));
  }
}

export function extracted(options: RequestOptionsArgs) {
  if (options && options.url && options.url.length > 0 &&
      dssCoreURLS.indexOf(options.url.replace(/^\//,'')) === -1) {
    options.url = (isDevMode() ? '' : 'dss/') + options.url;
  }
  return options;
}