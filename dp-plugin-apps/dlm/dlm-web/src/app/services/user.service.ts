import {Injectable, isDevMode} from '@angular/core';
import {Http, RequestOptions} from '@angular/http';
import {Observable} from 'rxjs/Observable';
import { getHeaders, mapResponse } from 'utils/http-util';
import {User} from 'models/user.model';

@Injectable()
export class UserService {

  static signoutURL = '/auth/signOut';

  constructor(private http: Http) {
  }

  getUserDetail(): Observable<User> {
    // Access Dataplane API directly to get user details
    const urlPrefix = this.getUrlPrefix();
    // Do not make a request in Dev mode
    if (!isDevMode()) {
      return mapResponse(this.http.get(urlPrefix + '/auth/userDetail', new RequestOptions(getHeaders())));
    }
    return Observable.of(<User>{});
  }

  logoutUser() {
    // Access Dataplane API directly to log the user out
    window.location.pathname = UserService.signoutURL;
  }

  /**
   * Get absolute URL prefix required to access Dataplane API
   * @returns {string}
   */
  getUrlPrefix(): string {
    const protocol = window.location.protocol;
    const host = window.location.hostname;
    let port = window.location.port;
    port = port ? ':' + port : '';
    return protocol + '//' + host + port;
  }
}
