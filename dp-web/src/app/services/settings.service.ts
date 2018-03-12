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
import {LDAPUser} from '../models/ldap-user';
import {HttpUtil} from '../shared/utils/httpUtil';
import {User, UserList} from '../models/user';
import {Subject} from 'rxjs/Subject';

@Injectable()
export class SettingsService {

  url = 'api/settings';

  constructor(private http: Http) {
  }

  uploadCert(name:string, format:string, fileContent: any){
    return this.http
      .post(`${this.url}/create-cert`, {name:name, format:format, data:fileContent, active: true} , new RequestOptions(HttpUtil.getHeaders()))
      .map(HttpUtil.extractData)
      .catch(HttpUtil.handleError);
  }

  listCerts(){
    return this.http
      .get(`${this.url}/certs` , new RequestOptions(HttpUtil.getHeaders()))
      .map(HttpUtil.extractData)
      .catch(HttpUtil.handleError);
  }

  deleteCert(id:string){
    return this.http
      .delete(`${this.url}/delete-cert/${id}`, new RequestOptions(HttpUtil.getHeaders()))
      .map(HttpUtil.extractData)
      .catch(HttpUtil.handleError);
  }
}
