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

import { Injectable } from '@angular/core';
import { Http, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs/Observable';

import { User } from '../models/user';

import { HttpUtil } from '../shared/utils/httpUtil';
import {LDAPProperties, LDAPUpdateProperties} from '../models/ldap-properties';

@Injectable()
export class ConfigurationService {
  uri = 'api/init';
  knowConfigUri = 'api/knox';
  configUri = 'api/config';

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

  updateLDAP(ldapUpdateProperties: LDAPUpdateProperties): Observable<LDAPUpdateProperties>{
    return this.http
      .post(`${this.knowConfigUri}/ldap`,ldapUpdateProperties, new RequestOptions(HttpUtil.getHeaders()))
      .map(HttpUtil.extractData)
      .catch(HttpUtil.handleError)
  }

  isKnoxConfigured(): Observable<any> {
    return this.http
      .get(`${this.knowConfigUri}/status`, new RequestOptions(HttpUtil.getHeaders()))
      .map(HttpUtil.extractData)
      .catch(HttpUtil.handleError);
  }

  getLdapConfiguration(): Observable<LDAPProperties> {
    return this.http
      .get(`${this.knowConfigUri}/ldap`, new RequestOptions(HttpUtil.getHeaders()))
      .map(HttpUtil.extractData)
      .catch(HttpUtil.handleError);
  }

  getGATrackingStatus() : Observable<boolean>{
    return this.http.get(`${this.configUri}/ga-tracking-status`, new RequestOptions(HttpUtil.getHeaders()))
      .map((response:any) => response._body === "true")
      .catch(HttpUtil.handleError);
  }
}
