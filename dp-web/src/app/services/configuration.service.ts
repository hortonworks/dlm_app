import { Injectable } from '@angular/core';
import { Http, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs/Observable';

import { User } from '../models/user';

import { HttpUtil } from '../shared/utils/httpUtil';
import {LDAPProperties} from '../models/ldap-properties';

@Injectable()
export class ConfigurationService {
  uri = '/api/init';
  knowConfigUri = '/api/knox';

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

  configureLDAP(ldapProperties: LDAPProperties): Observable<LDAPProperties>{
    return this.http
      .post(`${this.knowConfigUri}/configure`,ldapProperties, new RequestOptions(HttpUtil.getHeaders()))
      .map(HttpUtil.extractData)
      .catch(HttpUtil.handleError)
  }

  isConfigurationComplete(): Observable<boolean>{
    //TODO Mock to replaced with backend API call
    return Observable.of(false);
  }



}
