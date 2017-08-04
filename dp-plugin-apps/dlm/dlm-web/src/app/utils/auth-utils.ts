import {User} from 'models/user.model';
import {Subject} from 'rxjs/Subject';
export class AuthUtils {

  private static user;

  public static loggedIn = new Subject<boolean>();
  public static loggedIn$ =  AuthUtils.loggedIn.asObservable();

  public static get signinURL() {
    const currentLocation = window.location.href.split('/');
    return `/login?landingPage=${currentLocation[0]}//${currentLocation[2]}`;
  }

  public static isUserLoggedIn() {
    return !!AuthUtils.getUser();
  }

  public static getUser(): User {
    return AuthUtils.user;
  }

  public static clearUser() {
    AuthUtils.user = null;
  }

  public static setUser(user: User) {
    AuthUtils.user = user;
    AuthUtils.loggedIn.next(true);
  }
}
