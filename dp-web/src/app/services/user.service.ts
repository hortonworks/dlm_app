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
export class UserService {

  url = '/api/users';
  dataChanged = new Subject<boolean>();
  dataChanged$ = this.dataChanged.asObservable();

  constructor(private http: Http) {
  }

  checkuser(): Observable<boolean> {
    return Observable.of(Math.random() < 0.5);
  }

  checkGroup(): Observable<boolean> {
    return Observable.of(Math.random() < 0.5);
  }

  getUserDetail(): Observable<User> {
    return this.http.get('/auth/userDetail', new RequestOptions(HttpUtil.getHeaders()))
      .map(HttpUtil.extractData)
      .catch(HttpUtil.handleError)
  }

  searchLDAPUsers(searchTerm: string): Observable<LDAPUser[]> {
    return this.http
      .get(`${this.url}/ldapsearch?name=${searchTerm}&fuzzyMatch=false`, new RequestOptions(HttpUtil.getHeaders()))
      .map(HttpUtil.extractData)
      .catch(HttpUtil.handleError);
  }

  searchLDAPGroups(searchTerm: string): Observable<any> {
    return this.http
      .get(`${this.url}/ldapsearch?name=${searchTerm}&fuzzyMatch=false&searchType=group`, new RequestOptions(HttpUtil.getHeaders()))
      .map(HttpUtil.extractData)
      .catch(HttpUtil.handleError);
  }

  addAdminUsers(users: string[]): Observable<any> {
    return this.http
      .post(`${this.url}/registerAdmins`, {users: users}, new RequestOptions(HttpUtil.getHeaders()))
      .map(HttpUtil.extractData)
      .catch(HttpUtil.handleError);
  }

  getUsersWithRole(offset: number, pageSize: number, searchTerm?: string): Observable<UserList> {
    let url = `${this.url}/withRoles?offset=${offset}&pageSize=${pageSize}`;
    if (searchTerm && searchTerm.trim().length > 0) {
      url = `${url}&searchTerm=${searchTerm}`;
    }
    return this.http
      .get(url, new RequestOptions(HttpUtil.getHeaders()))
      .map(HttpUtil.extractData)
      .catch(HttpUtil.handleError);
  }

  getUserByName(userName): Observable<User> {
    return this.http
      .get(`${this.url}/detail?userName=${userName}`, new RequestOptions(HttpUtil.getHeaders()))
      .map(HttpUtil.extractData)
      .catch(HttpUtil.handleError);
  }

  getAllRoles(): Observable<any[]> {
    return this.http
      .get(`/api/roles`, new RequestOptions(HttpUtil.getHeaders()))
      .map(HttpUtil.extractData)
      .catch(HttpUtil.handleError);
  }

  addUsers(users: string[], roles: string[]): Observable<any> {
    return this.http
      .post(`${this.url}/addUsersWithRoles`, {users: users, roles: roles}, new RequestOptions(HttpUtil.getHeaders()))
      .map(HttpUtil.extractData)
      .catch(HttpUtil.handleError);
  }

  updateUser(user): Observable<any> {
    return this.http
      .post(`${this.url}/updateActiveAndRoles`, user, new RequestOptions(HttpUtil.getHeaders()))
      .map(HttpUtil.extractData)
      .catch(HttpUtil.handleError);
  }
}
