import { Request, RequestMethod } from '@angular/http';

const MOCK_FILES_PREFIX = '/assets/data/dlm/';

/**
 * Generates route to mock request's response by url and method with predefined
 * json file.
 * Note that all request method will be overriden to Get.
 *
 * @param  {string}        url      path to mock prefix /api/dlm will be added
 * @param  {string}        jsonFile json file to respond with, root dir is assets/data/dlm
 * @param  {RequestMethod} [method]   request method
 */
export class MockRoute {
  apiPrefix = '/api/';

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
    const matchedTokens = selfTokens.filter((token, id) => {
      return token === sourceTokens[id];
    });
    const isFullMatch = matchedTokens.length === sourceTokens.length;
    const isDynamicMatch = matchedTokens.length === sourceTokens.length - 1
      && selfTokens[selfTokens.length - 1].startsWith(':');
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
