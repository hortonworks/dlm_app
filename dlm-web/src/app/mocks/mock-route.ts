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

import { API_PREFIX } from 'constants/api.constant';
import { HttpRequest } from '@angular/common/http/src/request';

const MOCK_FILES_PREFIX = '/assets/data/dlm/';

type FileHandler = (request: HttpRequest<any>) => string;

/**
 * Generates route to mock request's response by url and method with predefined
 * json file.
 * Note that all request method will be overridden to Get.
 *
 * @param  {string}        url      path to mock prefix /api/dlm will be added
 * @param  {string|FileHandler}        jsonFileOrHandler json file to respond with, root dir is assets/data/dlm
 * @param  {RequestMethod} [method]   request method
 */
export class MockRoute {
  apiPrefix = API_PREFIX;
  constructor(private url: string, private jsonFileOrHandler: string|FileHandler, private method?: string) {
    if (!url.startsWith('api')) {
      this.url = this.apiPrefix + url;
    }
    if (!method) {
      this.method = 'GET';
    }
  }

  private tokens(url: string) {
    return url.split('?')[0].split('/');
  }

  match(request: HttpRequest<any>): boolean {
    const sourceTokens: string[] = this.tokens(request.url);
    const selfTokens: string[] = this.tokens(this.url);
    if (this.method !== request.method || sourceTokens.length !== selfTokens.length) {
      return false;
    }
    const matchedTokens = selfTokens.reduce((matchedMap, token, tokenIndex) => {
      const sourceToken = sourceTokens[tokenIndex];
      if (sourceToken === undefined) {
        return matchedMap;
      }
      if (token === sourceToken) {
        return {
          fullMatch: matchedMap.fullMatch.concat(token),
          dynamicMatch: matchedMap.dynamicMatch.concat(token)
        };
      }
      if (token.startsWith(':')) {
        return {
          ...matchedMap,
          dynamicMatch: matchedMap.dynamicMatch.concat(sourceToken)
        };
      }
      return matchedMap;
    }, { fullMatch: [], dynamicMatch: []});
    const isFullMatch = matchedTokens.fullMatch.length === sourceTokens.length;
    const isDynamicMatch = matchedTokens.dynamicMatch.length === sourceTokens.length;
    // todo: maybe do some stuff with :id, e.g. pattern file name like cluster_:id.json
    return isFullMatch || isDynamicMatch;
  }

  toRequest(originalRequest: HttpRequest<any>): HttpRequest<any> {
    const file = typeof this.jsonFileOrHandler === 'function' ?
      this.jsonFileOrHandler(originalRequest) : this.jsonFileOrHandler;
    const request = originalRequest.clone({
      url: MOCK_FILES_PREFIX + file,
      method: 'GET'
    });
    return request;
  }
}
