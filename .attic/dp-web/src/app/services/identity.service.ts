import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { User } from '../models/user';
import { HttpUtil } from '../shared/utils/httpUtil';

@Injectable()
export class IdentityService {

  url = '/api/identity';

  constructor(private http:Http) {}

  retrieve(): Observable<User> {
    return this.http
      .get(`${this.url}`, new RequestOptions(HttpUtil.getHeaders()))
      .map(HttpUtil.extractData)
      .catch(HttpUtil.handleError);
  }

}
