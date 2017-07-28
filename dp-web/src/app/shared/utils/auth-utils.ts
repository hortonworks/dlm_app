import {User} from '../../models/user';
import {Subject} from 'rxjs/Subject';
export class AuthUtils {

  private static user;
  private static validUser;

  public static loggedIn = new Subject<boolean>();
  public static loggedIn$ =  AuthUtils.loggedIn.asObservable();

  public static get signinURL() {
    let currentLocation = window.location.href.split('/');
    return `/login?landingPage=${currentLocation[0]}//${currentLocation[2]}`
  }

  public static signoutURL = '/auth/signOut';

  public static isUserLoggedIn() {
    return !!this.getUser();
  }

  public static isValidUser(){
    return this.validUser;
  }

  public static setValidUser(isValid: boolean){
    this.validUser = isValid;
  }

  public static getUser(): User {
    return this.user;
  }

  public static clearUser(){
    this.user = null;
  }

  public static setUser(user: User) {
    this.user = user;
    this.loggedIn.next(true);
  }
}
