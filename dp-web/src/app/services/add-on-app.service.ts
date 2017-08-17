import {Injectable} from '@angular/core';
import {Http, RequestOptions} from '@angular/http';
import {Observable} from 'rxjs/Observable';

import {HttpUtil} from '../shared/utils/httpUtil';
import {AddOnAppInfo, ConfigPayload, EnabledAppInfo, SKU} from '../models/add-on-app';

@Injectable()
export class AddOnAppService {

  uri = '/api/services';

  private dependenciesMap = new Map();

  constructor(private http: Http) {
    this.dependenciesMap.set('dlm', ['BEACON', 'HDFS', 'HIVE']);
    this.dependenciesMap.set('dss', ['ATLAS', 'RANGER'])
  }

  getServiceDependencies(appName) {
    return this.dependenciesMap.get(appName);
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
