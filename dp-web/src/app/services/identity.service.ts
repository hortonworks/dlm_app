import {Injectable} from '@angular/core';
import {Http, RequestOptions} from '@angular/http';
import {Observable} from 'rxjs/Observable';
import {User} from '../models/user';
import {HttpUtil} from '../shared/utils/httpUtil';
import {AuthUtils} from '../shared/utils/auth-utils';
import {AuthenticationService} from './authentication.service';

@Injectable()
export class IdentityService {

  url = '/api/identity';

  constructor(private http: Http, private authenticationService: AuthenticationService) {
  }

  getUser() {
    return Observable.create(observer => {
      this.authenticationService.isAuthenticated().subscribe(isAuthenticated => {
        if (isAuthenticated) {
          observer.next(AuthUtils.getUser());
        }
      });
    });
  }

  getUserById(id: string): Observable<User> {
    return this.http
      .get(`${this.url}/${id}`, new RequestOptions(HttpUtil.getHeaders()))
      .map(HttpUtil.extractData)
      .catch(HttpUtil.handleError);
  }
}
