import {Injectable} from '@angular/core';
import {Http, RequestOptions} from '@angular/http';
import {Observable} from 'rxjs/Observable';

import {HttpUtil} from '../shared/utils/httpUtil';

@Injectable()
export class RangerService {
  uri = '/api/ranger';

  constructor(private http: Http) {
  }

  getAuditDetails(clusterId:string, dbName:string, tableName:string, offset:number, limit:number) : Observable<any>{
    const uri = `${this.uri}/audit/${clusterId}/${dbName}/${tableName}?offset=${offset}&limit=${limit}`;
    return this.http
      .get(uri, new RequestOptions(HttpUtil.getHeaders()))
      .map(HttpUtil.extractData)
      .catch(HttpUtil.handleError);
  }
}
