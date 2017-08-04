import {Injectable} from '@angular/core';
import {Http, RequestOptions} from '@angular/http';
import {Observable} from 'rxjs/Observable';

import {HttpUtil} from '../shared/utils/httpUtil';
import {AuditSchema} from '../models/auditSchema';

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
      .map(this.formatAuditData)
      .catch(err => {
      	if(err.status == 404) return Observable.throw(err);
      	return HttpUtil.handleError(err)
      });
  }
  formatAuditData (data:any) : AuditSchema[] {
  	let auditData:AuditSchema[] = [];
  	data.vXAccessAudits.forEach(d=>{ //2017-07-28T07:45:09Z
  	  let m = d.eventTime.match(/^(\d+)-(\d+)-(\d+)T(\d+)\:(\d+)\:(\d+)Z$/);
  	  d.eventTime = `${m[2]}/${m[3]}/${m[1]} ${m[4]}:${m[5]}:${m[6]} GMT`
  	  d.accessResult = (d.accessResult)?"ALLOWED":"DENIED";
  	  auditData.push(d as AuditSchema)
  	})
  	return auditData;
  }
}
