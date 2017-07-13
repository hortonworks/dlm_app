import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { User } from '../models/user';
import { HttpUtil } from '../shared/utils/httpUtil';
import {JwtHelper} from 'angular2-jwt';

@Injectable()
export class IdentityService {

  url = '/api/identity';

  constructor(private http:Http, private jwtHelper: JwtHelper) {}

  retrieve(): Observable<{
    user: User,
    lake: boolean,
    auth: boolean,
    rbac: boolean
  }> {
    return this.http
      .get(`${this.url}`, new RequestOptions(HttpUtil.getHeaders()))
      .map(HttpUtil.extractData)
      .catch(HttpUtil.handleError);
  }

  isUserAuthenticated() {
    return this.getCookie('dp_jwt') && !this.jwtHelper.isTokenExpired(this.getCookie('dp_jwt'));
  }

  getUser() {
    return JSON.parse(this.jwtHelper.decodeToken(this.getCookie('dp_jwt')).user) as User;
  }

  getUserById(id: string): Observable<User>{
    return this.http
      .get(`${this.url}/${id}`, new RequestOptions(HttpUtil.getHeaders()))
      .map(HttpUtil.extractData)
      .catch(HttpUtil.handleError);
  }

  getCookie(name: string) {
    let ca: Array<string> = document.cookie.split(';');
    let caLen: number = ca.length;
    let cookieName = `${name}=`;
    let c: string;

    for (let i: number = 0; i < caLen; i += 1) {
      c = ca[i].replace(/^\s+/g, '');
      if (c.indexOf(cookieName) == 0) {
        return c.substring(cookieName.length, c.length);
      }
    }
    return '';
  }

}
