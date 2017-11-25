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
import {Router} from '@angular/router';
import {Observable} from 'rxjs/Rx';

import {HttpUtil, HEADER_CHALLENGE_HREF} from '../shared/utils/httpUtil';

import {Credential} from '../models/credential';
import {User} from '../models/user';
import {AuthUtils} from '../shared/utils/auth-utils';

@Injectable()
export class AuthenticationService {

  private URI: string = 'auth';

  constructor(private http: Http, private router: Router) {
  }

  isAuthenticated(): Observable<boolean> {
    return Observable.create(observer => {
      if (!AuthUtils.isUserLoggedIn()) {
        observer.next(false);
      }else{
        observer.next(true);
      }
    });
  }

  signIn(credential: Credential): Observable<User> {
    return this.http
      .post(`${this.URI}/in`, credential, new RequestOptions(HttpUtil.getHeaders()))
      .map(HttpUtil.extractData)
      .do((user: User) => {
        AuthUtils.setUser(user);
        return user;
      });
  }

  signOut(): Observable<string> {
    return this.http
      .get(`${this.URI}/out`)
      .map(response => {
        const header = response.headers.get(HEADER_CHALLENGE_HREF);
        return typeof header === 'string' ? header : null;
      });
  }

  signOutAndRedirect() {
    this.signOut()
      .subscribe(challengeAt => {
        AuthUtils.clearUser();
        const redirectTo = `${window.location.protocol}//${window.location.host}/${challengeAt}`;
        window.location.href = `${redirectTo}?originalUrl=${window.location.protocol}//${window.location.host}/`;
      });
  }
}
