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

import {Injectable} from "@angular/core";
import {Http, RequestOptions} from "@angular/http";
import {Observable} from "rxjs";
import {DataLakeDashboard} from '../models/data-lake-dashboard';
import {ProfilerMetricRequest} from '../models/profiler-metric-request';
import {ProfilerMetricResponse} from '../models/profiler-metric-response';
import {HttpUtil} from '../shared/utils/httpUtil';

@Injectable()
export class ProfilerService {
  constructor(private http: Http) {
  }

  assetCollectionStats(profilerMetricRequest: ProfilerMetricRequest): Observable<ProfilerMetricResponse> {
    const url = '/api/dpProfiler/metrics';
    return this.http.post(url, profilerMetricRequest, new RequestOptions(HttpUtil.getHeaders()))
                .map(HttpUtil.extractData);

    // return Observable.create(observer => {
    //   observer.next(ProfilerMetricResponse.getData());
    //   observer.complete();
    // });
  }

  dataLakeStats(dataLakeId: number): Observable<DataLakeDashboard> {
    const url = '';
    return Observable.create(observer => {
      observer.next(DataLakeDashboard.getData());
      observer.complete();
    });
  }
}