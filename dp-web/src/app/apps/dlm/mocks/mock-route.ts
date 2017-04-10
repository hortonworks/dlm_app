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
  apiPrefix: string = '/api/dlm/';

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
    const unmatchedTokens = sourceTokens.filter((token, id) => {
      return token !== selfTokens[id];
    });
    // todo: maybe do some stuff with :id, e.g. pattern file name like cluster_:id.json
    return !unmatchedTokens.length || unmatchedTokens[0].startsWith(':');
  }

  toRequest(originalRequest: Request): Request {
    let r: Request = originalRequest;
    r.url = MOCK_FILES_PREFIX + this.jsonFile;
    r.method = RequestMethod.Get;
    return r;
  }
}
