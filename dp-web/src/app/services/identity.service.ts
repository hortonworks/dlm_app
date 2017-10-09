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
import {User} from '../models/user';
import {HttpUtil} from '../shared/utils/httpUtil';

@Injectable()
export class IdentityService {

  url = '/api/identity';

  constructor(private http: Http) {
  }

  getUserById(id: string): Observable<User> {
    return this.http
      .get(`${this.url}/${id}`, new RequestOptions(HttpUtil.getHeaders()))
      .map(HttpUtil.extractData)
      .catch(HttpUtil.handleError);
  }

  changePassword(password: string, nextPassword: string): Observable<void> {
    return this.http
      .post(`${this.url}/actions/change-password`, {
        password,
        nextPassword,
      }, new RequestOptions(HttpUtil.getHeaders()))
      .map(HttpUtil.extractData)
      .catch(HttpUtil.handleError);
  }
}
