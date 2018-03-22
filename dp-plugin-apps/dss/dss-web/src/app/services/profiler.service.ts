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
import {ProfilerInfoWithJobsCount, JobInfoModel, ProfilerInfoWithAssetsCount} from '../models/profiler-models';

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

  getStatusWithJobCounts(clusterId:number, startTime:number, endTime:number) : Observable<Array<ProfilerInfoWithJobsCount>> {
    const uri = `/api/dpProfiler/${clusterId}/status-with-jobs-count?startTime=${startTime}&endTime=${endTime}`;
    return this.http
      .get(uri, new RequestOptions(HttpUtil.getHeaders()))
      .map(HttpUtil.extractData)
      .map(res=>res.data)
      .catch(HttpUtil.handleError);
  }

  getStatusWithAssetsCounts(clusterId:number, startTime:number, endTime:number) : Observable<Array<ProfilerInfoWithAssetsCount>> {
    const uri = `/api/dpProfiler/${clusterId}/status-with-assets-count?startTime=${startTime}&endTime=${endTime}`;
    return this.http
      .get(uri, new RequestOptions(HttpUtil.getHeaders()))
      .map(HttpUtil.extractData)
      .map(res=>res.data)
      .catch(HttpUtil.handleError);
  }


  jobsList(clusterId:number, offset:number, limit:number, sortBy:string, sorOrder:string, startTime:number, endTime:number, profilerIds:Array<number>, statusArray:Array<String>) : Observable<Array<JobInfoModel>> {
    let uri = `/api/dpProfiler/${clusterId}/jobs?offset=${offset}&limit=${limit}&sortBy=${sortBy}&sortDir=${sorOrder}&startTime=${startTime}&endTime=${endTime}`;
    profilerIds.forEach(id => uri += `&profilerIds=${id}`);
    statusArray.forEach(status => uri += `&status=${status}`);
    return this.http
      .get(uri, new RequestOptions(HttpUtil.getHeaders()))
      .map(HttpUtil.extractData)
      .map(res=>res.data)
      .catch(HttpUtil.handleError);
  }

  putProfilerState(clusterId:number, name:string, state:boolean) : Observable<any> {
    const uri = `/api/dpProfiler/${clusterId}/profilerinstances/state?name=${name}&active=${state}`;
    return this.http
      .put(uri, {}, new RequestOptions(HttpUtil.getHeaders()))
      .map(HttpUtil.extractData)
      .map(res=>res.data)
      .catch(HttpUtil.handleError);
  }

  getProfilerHistories(clusterId:number, name:string, startTime:number, endTime:number) : Observable<any> {
    const uri = `/api/dpProfiler/${clusterId}/histories?profilerName=${name}&startTime=${startTime}&endTime=${endTime}`;
    return this.http
      .get(uri, new RequestOptions(HttpUtil.getHeaders()))
      .map(HttpUtil.extractData)
      .map(res=>res.data)
      .catch(HttpUtil.handleError);
  }

}