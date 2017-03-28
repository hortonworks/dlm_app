import {Injectable} from '@angular/core';
import {Http, Headers, RequestOptions, Response, ResponseOptions} from '@angular/http';
import {Observable} from 'rxjs/Observable';
import {Lake} from '../models/lake';
import {HttpUtil} from '../shared/utils/httpUtil';

@Injectable()
export class LakeService {
  url = '/api/lakes';

  constructor(private http:Http) {}

  insert(lake: Lake): Observable<Lake> {
    return this.http
      .post(`${this.url}`, lake, new RequestOptions(HttpUtil.getHeaders()))
      .map(HttpUtil.extractData)
      .catch(HttpUtil.handleError);
  }

  retrieve(lakeId: string): Observable<Lake> {
    return this.http
      .post(`${this.url}/${lakeId}`, new RequestOptions(HttpUtil.getHeaders()))
      .map(HttpUtil.extractData)
      .catch(HttpUtil.handleError);
  }

  // update(lakeId: string, lake: Lake): Observable<Lake> {
  //   return this.http
  //     .put(`${this.url}/${lakeId}`, lake, new RequestOptions(HttpUtil.getHeaders()))
  //     .map(HttpUtil.extractData)
  //     .catch(HttpUtil.handleError);
  // }

  // remove(lakeId: string): Observable<Lake> {
  //   // TODO
  // }

}
