import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { LDAPUser } from '../models/ldap-user';
import { HttpUtil } from '../shared/utils/httpUtil';

@Injectable()
export class UserService {

  url = '/api/users';

  constructor(private http:Http) {}

  searchLDAPUsers(searchTerm: string) : Observable<LDAPUser[]>{
    return this.http
      .get(`${this.url}/ldapsearch?name=${searchTerm}&fuzzyMatch=true`, new RequestOptions(HttpUtil.getHeaders()))
      .map(HttpUtil.extractData)
      .catch(HttpUtil.handleError);
  }
}
