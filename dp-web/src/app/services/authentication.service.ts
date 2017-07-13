import {Injectable} from '@angular/core';
import {Http, RequestOptions} from '@angular/http';
import {Observable} from 'rxjs/Rx';

import {HttpUtil} from '../shared/utils/httpUtil';

import {Credential} from '../models/credential';
import {User} from '../models/user';
import {Subject} from 'rxjs/Subject';
import {JwtHelper} from 'angular2-jwt';

@Injectable()
export class AuthenticationService {
  private URI: string = 'auth';
  private isUserAuthenticated: boolean = false;
  private ssoCheckCookieName = 'sso_login_valid';
  private jwtHelper: JwtHelper = new JwtHelper();

  userAuthenticated = new Subject<boolean>();
  userAuthenticated$ = this.userAuthenticated.asObservable();

  constructor(private http: Http) {
    this.isUserAuthenticated = this.getCookie('dp_jwt') && !this.jwtHelper.isTokenExpired(this.getCookie('dp_jwt'));
  }

  isAuthenticated() : Observable<boolean> {
    return Observable.create(observer =>{
      if(!this.getCookie('dp_jwt')){
        observer.next(false);
        observer.complete();
        return;
      }
      observer.next(!this.jwtHelper.isTokenExpired(this.getCookie('dp_jwt')))
    });
  }

  isUserLoggedIn() {
    return this.isKnoxSSOLoggedIn() || this.isUserAuthenticated;
  }

  redirectToSignIn() {
    let currentLocation = window.location.href.split("/");
    window.location.href = `/login?landingPage=${currentLocation[0]}//${currentLocation[2]}&signInUrl=/sign-in`;
  }

  isKnoxSSOLoggedIn() {
    console.log('sso check cookie=', this.getCookie(this.ssoCheckCookieName));
    return this.getCookie(this.ssoCheckCookieName) === 'true'
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

  deleteCookie(name: string) {
    document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
  }

  signIn(credential: Credential): Observable<User> {
    return this.http
      .post(`${this.URI}/in`, credential, new RequestOptions(HttpUtil.getHeaders()))
      .map(HttpUtil.extractData)
      .do((user: User) => {
        this.isUserAuthenticated = true;
        this.setUser(user);
      });
  }

  removeUser() {
    localStorage.removeItem('dp_user');
  }

  setUser(user: User) {
    localStorage.setItem('dp_user', JSON.stringify(user))
  }

  signOut() {
   window.location.href = '/auth/signOut';
   return Observable.of(true);
  }
}
