import { Request, RequestMethod } from '@angular/http';

const MOCK_FILES_PREFIX = '/assets/data/dlm/';

/**
 * Generates route to mock request's response by url and method with predefined
 * json file.
 * Note that all request method will be overridden to Get.
 *
 * @param  {string}        url      path to mock prefix /api/dlm will be added
 * @param  {string}        jsonFile json file to respond with, root dir is assets/data/dlm
 * @param  {RequestMethod} [method]   request method
 */
export class MockRoute {
  apiPrefix = '/dlm/api/';

  constructor(private url: string, private jsonFile: string, private method?: RequestMethod) {
    this.url = this.apiPrefix + url;
    if (!method) {
      this.method = RequestMethod.Get;
    }
  }

  private tokens(url: string) {
    return url.split('?')[0].split('/');
  }

  match(request: Request): boolean {
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

  toRequest(originalRequest: Request): Request {
    const r: Request = originalRequest;
    r.url = MOCK_FILES_PREFIX + this.jsonFile;
    r.method = RequestMethod.Get;
    return r;
  }
}
