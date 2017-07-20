import {Injectable} from '@angular/core';
import {Http, RequestOptions} from '@angular/http';
import {Observable} from 'rxjs/Observable';
import {User} from '../models/user';
import {HttpUtil} from '../shared/utils/httpUtil';

@Injectable()
export class IdentityService {

  url = '/api/identity';

  constructor(private http: Http) {
  }

  getUserById(id: string): Observable<User> {
    return this.http
      .get(`${this.url}/${id}`, new RequestOptions(HttpUtil.getHeaders()))
      .map(HttpUtil.extractData)
      .catch(HttpUtil.handleError);
  }
}
