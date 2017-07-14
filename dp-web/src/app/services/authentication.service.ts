import {Injectable} from '@angular/core';
import {Http, RequestOptions} from '@angular/http';
import {Observable} from 'rxjs/Rx';

import {HttpUtil} from '../shared/utils/httpUtil';

import {Credential} from '../models/credential';
import {User} from '../models/user';
import {AuthUtils} from '../shared/utils/auth-utils';

@Injectable()
export class AuthenticationService {

  private URI: string = 'auth';

  constructor(private http: Http) {
  }

  isAuthenticated(): Observable<boolean> {
    return Observable.create(observer => {
      if (!AuthUtils.isDPCookieValid()) {
        observer.next(false);
      }else{
        observer.next(true);
      }
    });
  }

  redirectToSignIn() {
    window.location.href = AuthUtils.signinURL;
  }

  signIn(credential: Credential): Observable<User> {
    return this.http
      .post(`${this.URI}/in`, credential, new RequestOptions(HttpUtil.getHeaders()))
      .map(HttpUtil.extractData)
      .do((user: User) => {
        return user;
      });
  }

  signOut() {
    window.location.href = AuthUtils.signoutURL;
    return Observable.of(true);
  }
}
