import {Injectable} from '@angular/core';
import {Http, Headers, RequestOptions, Response, ResponseOptions} from '@angular/http';
import {Observable} from 'rxjs/Observable';
import {Location} from '../models/location';
import {HttpUtil} from '../shared/utils/httpUtil';

@Injectable()
export class LocationService {
  url = '/api/locations';

  constructor(private http:Http) {}

  retrieve(locationId: number): Observable<Location> {
    return this.http
      .get(`${this.url}/${locationId}`, new RequestOptions(HttpUtil.getHeaders()))
      .map(HttpUtil.extractData)
      .catch(HttpUtil.handleError);
  }

  retrieveOptions(query: string): Observable<Location[]> {
    return this.http
      .get(`${this.url}?query=${query}`, new RequestOptions(HttpUtil.getHeaders()))
      .map(HttpUtil.extractData)
      .catch(HttpUtil.handleError);
  }

}
