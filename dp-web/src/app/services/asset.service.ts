/*
 *
 *  * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *  *
 *  * Except as expressly permitted in a written agreement between you or your company
 *  * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 *  * reproduction, modification, redistribution, sharing, lending or other exploitation
 *  * of all or any part of the contents of this software is strictly prohibited.
 *
 */

import {Injectable} from '@angular/core';
import {Http, RequestOptions} from '@angular/http';
import {Observable} from 'rxjs/Observable';
import {AssetDetails} from '../models/asset-property';
import {AssetTag} from '../models/asset-tag';

import {HttpUtil} from '../shared/utils/httpUtil';
import {AssetSchema} from '../models/asset-schema';

@Injectable()
export class AssetService {
  uri = '/api/assets';

  constructor(private http: Http) {
  }

  getDetails(clusterId:string, assetId: string) : Observable<AssetDetails>{
    const uri = `${this.uri}/details/${clusterId}/${assetId}`;
    return this.http
      .get(uri, new RequestOptions(HttpUtil.getHeaders()))
      .map(HttpUtil.extractData)
      .catch(HttpUtil.handleError);
  }

  startProfiling(clusterId:string, dbName:string, tableName:string) : Observable<any>{
    const uri = `/api/dpProfiler/startJob?clusterId=${clusterId}&dbName=${dbName}&tableName=${tableName}`;
    return this.http
      .post(uri, new RequestOptions(HttpUtil.getHeaders()))
      .map(HttpUtil.extractData)
      .catch(err => {
        if(err.status == 404 || err.status == 405) return Observable.throw(err);
        return HttpUtil.handleError(err)
      });

  }

  getProfilingStatus(clusterId:string, dbName:string, tableName:string) : Observable<any>{
    const uri = `/api/dpProfiler/jobStatus?clusterId=${clusterId}&dbName=${dbName}&tableName=${tableName}`;
    return this.http
      .get(uri, new RequestOptions(HttpUtil.getHeaders()))
      .map(HttpUtil.extractData)
      .catch(err => {
        if(err.status == 404 || err.status == 405) return Observable.throw(err);
        return HttpUtil.handleError(err)
      });
  }

}
