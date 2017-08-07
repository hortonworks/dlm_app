import {Injectable} from '@angular/core';
import {Http, RequestOptions} from '@angular/http';
import {Observable} from 'rxjs/Observable';

import {HttpUtil} from '../shared/utils/httpUtil';
import {AddOnAppInfo, ConfigPayload, EnabledAppInfo, SKU} from '../models/add-on-app';

@Injectable()
export class AddOnAppService {

  uri = '/api/services';

  constructor(private http: Http) {
  }

  getAllServices(): Observable<AddOnAppInfo[]> {
    return this.http
      .get(this.uri, new RequestOptions(HttpUtil.getHeaders()))
      .map(HttpUtil.extractData)
      .catch(HttpUtil.handleError);
  }

  getEnabledServices(): Observable<EnabledAppInfo[]> {
    return this.http
      .get(`${this.uri}/enabled`, new RequestOptions(HttpUtil.getHeaders()))
      .map(HttpUtil.extractData)
      .catch(HttpUtil.handleError);
  }

  enableService(configPayload: ConfigPayload) {
    return this.http
      .post(`${this.uri}/enable`, configPayload, new RequestOptions(HttpUtil.getHeaders()))
      .map(HttpUtil.extractData)
      .catch(HttpUtil.handleError);
  }

  verify(smartSenseid: string): Observable<any> {
    return this.http
      .post(`${this.uri}/verifyCode?smartSenseId=${smartSenseid}`, new RequestOptions(HttpUtil.getHeaders()))
      .map(HttpUtil.extractData)
      .catch(HttpUtil.handleError);
  }

  getServiceByName(name: string): Observable<SKU> {
    return this.http
      .get(`${this.uri}/byName?skuName=${name}`, new RequestOptions(HttpUtil.getHeaders()))
      .map(HttpUtil.extractData)
      .catch(HttpUtil.handleError);
  }
}
