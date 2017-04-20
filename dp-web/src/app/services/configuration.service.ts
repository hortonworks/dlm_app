import { Injectable } from '@angular/core';
import { Http, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs/Observable';

import { User } from '../models/user';

import { HttpUtil } from '../shared/utils/httpUtil';

@Injectable()
export class ConfigurationService {
  uri = '/api/init';

  constructor(private http:Http) { }

  retrieve(): Observable<{
    user: User,
    lakeWasInitialized: boolean,
    authWasInitialized: boolean,
    rbacWasInitialized: boolean
  }>{
    return this.http
      .get(this.uri, new RequestOptions(HttpUtil.getHeaders()))
      .map(HttpUtil.extractData)
      .catch(HttpUtil.handleError);
  }

}
