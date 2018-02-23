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
import {Http, Headers, RequestOptions} from '@angular/http';
import {Observable} from 'rxjs/Observable';
import {Cluster, ClusterHealthSummary} from '../models/cluster';
import {ClusterDetailRequest} from '../models/cluster-state';
import {HttpUtil} from '../shared/utils/httpUtil';

@Injectable()
export class ClusterService {
  uri = 'api/clusters';

  constructor(private http:Http) { }

  syncCluster(lakeId): Observable<any> {
    return this.http
      .post(`/api/lakes/${lakeId}/sync`, new RequestOptions(HttpUtil.getHeaders()))
      .catch(HttpUtil.handleError);
  }

  listByLakeId({ lakeId }): Observable<Cluster[]>{
    const uri = lakeId ? `${this.uri}?dpClusterId=${lakeId}` : this.uri;
    return this.http
      .get(uri, new RequestOptions(HttpUtil.getHeaders()))
      .map(HttpUtil.extractData)
      .catch(HttpUtil.handleError);
  }

  list(): Observable<Cluster[]>{
    return this.http
      .get(this.uri, new RequestOptions(HttpUtil.getHeaders()))
      .map(HttpUtil.extractData)
      .catch(HttpUtil.handleError);
  }

  insert(cluster: Cluster): Observable<Cluster> {
    return this.http
      .post(`${this.uri}`, cluster, new RequestOptions(HttpUtil.getHeaders()))
      .map(HttpUtil.extractData)
      .catch(HttpUtil.handleError);
  }

  retrieveHealth(clusterId: number): Observable<ClusterHealthSummary>  {
    const uri = `${this.uri}/${clusterId}/health?summary=true`;

    return this.http
      .get(uri, new RequestOptions(HttpUtil.getHeaders()))
      .map(HttpUtil.extractData)
      .catch(HttpUtil.handleError);
  }

  retrieveDetailedHealth(clusterId: number): Observable<any> {
    const uri = `${this.uri}/${clusterId}/health`;
    return this.http
      .get(uri, new RequestOptions(HttpUtil.getHeaders()))
      .map(HttpUtil.extractData)
      .catch(HttpUtil.handleError);
  }

  retrieveResourceMangerHealth(clusterId: number) : Observable<any> {
    const uri = `${this.uri}/${clusterId}/rmhealth`;
    return this.http
      .get(uri, new RequestOptions(HttpUtil.getHeaders()))
      .map(HttpUtil.extractData)
      .catch(HttpUtil.handleError);
  }

  retrieveDataNodeHealth(clusterId: number) : Observable<any> {
    const uri = `${this.uri}/${clusterId}/dnhealth`;
    return this.http
      .get(uri, new RequestOptions(HttpUtil.getHeaders()))
      .map(HttpUtil.extractData)
      .catch(HttpUtil.handleError);
  }

  getClusterInfo(clusterDetailRequest:ClusterDetailRequest) :Observable<Cluster> {
    return this.http
      .post(`api/ambari/details`,clusterDetailRequest, new RequestOptions(HttpUtil.getHeaders()))
      .map(HttpUtil.extractData)
      .catch(HttpUtil.handleError);
  }

  getHostName(clusterId: number, ambariIp: string): Observable<any>{
    const uri = `${this.uri}/${clusterId}/hosts?ip=${ambariIp}`;
    return this.http
      .get(uri, new RequestOptions(HttpUtil.getHeaders()))
      .map(HttpUtil.extractData)
      .catch(HttpUtil.handleError);
  }

}
