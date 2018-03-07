/*
 *
 *  * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *  *
 *  * Except as expressly permitted in a written agreement between you or your company
 *  * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 *  * reproduction, modification, redistribution, sharing, lending or other exploitation
 *  * of all or any part of the contents of this software is strictly prohibited.
 *
 */

import {Injectable} from '@angular/core';
import {Http, RequestOptions} from '@angular/http';
import {Observable} from 'rxjs/Observable';

import {HttpUtil} from '../shared/utils/httpUtil';
import {AddOnAppInfo, AppDependency, ConfigPayload, EnabledAppInfo, SKU} from '../models/add-on-app';
import {Subject} from 'rxjs/Subject';

@Injectable()
export class AddOnAppService {

  uri = 'api/services';
  serviceEnabled = new Subject<string>();
  serviceEnabled$ = this.serviceEnabled.asObservable();

  statusCheckUri = 'health';

  constructor(private http: Http) {
  }
  getServiceStatus(appName): Observable<any>{
    return this.http
      .get(`${this.statusCheckUri}/${appName}`, new RequestOptions(HttpUtil.getHeaders()))
      .map(HttpUtil.extractData)
      .catch(HttpUtil.handleError);
  }

  getServiceDependencies(appName): Observable<AppDependency> {
    return this.http
      .get(`${this.uri}/${appName}/dependencies`, new RequestOptions(HttpUtil.getHeaders()))
      .map(HttpUtil.extractData)
      .do(a => {
        console.log(a);
      })
      .catch(HttpUtil.handleError);
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
