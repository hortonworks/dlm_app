import {Injectable} from '@angular/core';
import {Http, Headers, RequestOptions} from '@angular/http';
import {Observable} from 'rxjs/Observable';
import {LDAPUser} from '../models/ldap-user';
import {HttpUtil} from '../shared/utils/httpUtil';
import {User} from '../models/user';

@Injectable()
export class UserService {

  url = '/api/users';

  constructor(private http: Http) {
  }

  searchLDAPUsers(searchTerm: string): Observable<LDAPUser[]> {
    return this.http
      .get(`${this.url}/ldapsearch?name=${searchTerm}&fuzzyMatch=true`, new RequestOptions(HttpUtil.getHeaders()))
      .map(HttpUtil.extractData)
      .catch(HttpUtil.handleError);
  }

  addAdminUsers(users: string[]): Observable<any> {
    return this.http
      .post(`${this.url}/registerAdmins`, {users: users}, new RequestOptions(HttpUtil.getHeaders()))
      .map(HttpUtil.extractData)
      .catch(HttpUtil.handleError);
  }

  getUsersWithRole(): Observable<User[]> {
    return this.http
      .get(`${this.url}/withRoles`, new RequestOptions(HttpUtil.getHeaders()))
      .map(HttpUtil.extractData)
      .catch(HttpUtil.handleError);
  }

  getUserByName(userName) : Observable<User> {
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
}
