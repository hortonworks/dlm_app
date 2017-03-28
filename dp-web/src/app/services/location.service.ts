import {Injectable} from '@angular/core';
import {Http, Headers, RequestOptions, Response, ResponseOptions} from '@angular/http';
import {Observable} from 'rxjs/Observable';
import {Location} from '../models/location';
import {HttpUtil} from '../shared/utils/httpUtil';

@Injectable()
export class LocationService {
  url = '/api/locations';

  constructor(private http:Http) {}

  retrieveOptions(query: string) {
    return this.http
      .get(`${this.url}?query=${query}`, new RequestOptions(HttpUtil.getHeaders()))
      .map(HttpUtil.extractData)
      .catch(HttpUtil.handleError);
  }

}
