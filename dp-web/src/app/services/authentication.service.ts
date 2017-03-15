import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions, Response, ResponseOptions } from '@angular/http';
import { Observable } from 'rxjs/Observable';

import { HttpUtil } from '../shared/utils/httpUtil';

import { Credential } from '../models/credential';
import { User } from '../models/user';

@Injectable()
export class AuthenticationService {
  private URI: string = 'auth';
  private isUserAuthenticated: boolean = false;

  constructor(private http: Http) {
    this.isUserAuthenticated = !!localStorage.getItem('dp_auth_token');
  }

  isAuthenticated() {
    return this.isUserAuthenticated;
  }

  signIn(credential: Credential): Observable<User> {
    return this.http
      .post(`${this.URI}/in`, credential, new RequestOptions(HttpUtil.getHeaders()))
      .map(HttpUtil.extractData)
      .do((user: User) => {
        this.isUserAuthenticated = true;
        localStorage.setItem('dp_user', JSON.stringify(user))
        localStorage.setItem('dp_auth_token', user.token);
        localStorage.setItem('dp_userType', user.roles[0]);
      });
  }

  signOut() {
    localStorage.removeItem('dp_user');
    localStorage.removeItem('dp_auth_token');
    localStorage.removeItem('dp_userType');
    this.isUserAuthenticated = false;
  }

}
