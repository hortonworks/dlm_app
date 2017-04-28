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
  private ssoLogin=false;
  private ssoCheckPromise;
  private ssoCheckCookieName='sso_login_valid'
  constructor(private http: Http) {
    this.isUserAuthenticated = !!localStorage.getItem('dp_user');
    //this.isUserAuthenticated=true;
  }

  isAuthenticated() : Promise<boolean> {
    return new Promise<boolean>((resolve, reject) => {
      if(this.isUserAuthenticated){
        resolve(true);
      }else{
        this.http.get("/auth/userDetail")
        .map(HttpUtil.extractData)
        .subscribe(
          (user: User) => {
          this.isUserAuthenticated = true;
          this.setUser(user);
          //TODO setup the landing page which determines the target page when first time user logs in ...
          resolve(true);
        }, () => {
          reject(false)
        }
        );
      }
    });
  }
 
  isUserLoggedIn(){
    return this.isKnoxSSOLoggedIn() || this.isUserAuthenticated;
  }
  
  isKnoxSSOLoggedIn(){
    console.log("sso check cookie=",this.getCookie(this.ssoCheckCookieName))
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
  deleteCookie( name :string) {
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
  removeUser(){
        localStorage.removeItem('dp_user');
  }
  setUser(user:User){
      localStorage.setItem('dp_user', JSON.stringify(user))
  }
  signOut() {
    return new Promise<boolean>((resolve, reject) => {
      if (this.isKnoxSSOLoggedIn()){
      this.deleteCookie(this.ssoCheckCookieName);
      this.http.get("/auth/signOutThrougKnox").map(()=>{
        this.removeUser();
        this.isUserAuthenticated = false;
        resolve(true)
      }).subscribe();
    } else{
        this.removeUser();
        this.isUserAuthenticated = false;
        resolve(true)
      }
    });
  }
}
