import {Injectable} from '@angular/core';
import {Http, RequestOptions} from '@angular/http';
import {Observable} from 'rxjs/Observable';

import {HttpUtil} from '../shared/utils/httpUtil';
import {AddOnAppInfo, EnabledAppInfo} from '../models/add-on-app';

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

  enableService(serviceId) {

  }

  verify(smartSenseid: string) {

  }
}
