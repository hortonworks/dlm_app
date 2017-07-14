import {JwtHelper} from 'angular2-jwt';
import {User} from '../../models/user';
export class AuthUtils {

  private static jwtHelper: JwtHelper = new JwtHelper();

  public static get signinURL() {
    let currentLocation = window.location.href.split('/');
    return `/login?landingPage=${currentLocation[0]}//${currentLocation[2]}`
  }

  public static signoutURL = '/auth/signOut';

  private static dpCookie = 'dp_jwt';

  public static getDPJwtCookie() {
    return this.getCookie(this.dpCookie);
  }

  public static isDPCookieValid(): boolean {
    let dpCookie = AuthUtils.getDPJwtCookie();
    return dpCookie && !this.jwtHelper.isTokenExpired(dpCookie);
  }

  private static getCookie(name: string) {
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
    return null;
  }

  public static getUser(): User {
    if(this.getDPJwtCookie()){
      return JSON.parse(this.jwtHelper.decodeToken(AuthUtils.getDPJwtCookie()).user) as User;
    }
  }
}
