import { Injectable } from '@angular/core';
import { Http, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs/Rx';


import { HttpUtil } from '../shared/utils/httpUtil';

import { Credential } from '../models/credential';
import { User } from '../models/user';

@Injectable()
export class AuthenticationService {
  private URI: string = 'auth';
  private isUserAuthenticated: boolean = false;

  constructor(private http: Http) {
    this.isUserAuthenticated = !!localStorage.getItem('dp_user');
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
        });
  }

  signOut() {
    localStorage.removeItem('dp_user');
    this.isUserAuthenticated = false;
  }

}
