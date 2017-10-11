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

import { Injectable } from '@angular/core';
import { Http, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs/Observable';

import { Lake } from '../models/lake';
import { Cluster } from '../models/cluster';

import { HttpUtil } from '../shared/utils/httpUtil';
import {Subject} from 'rxjs/Subject';
import {Location} from '../models/location';


@Injectable()
export class LakeService {
  url = '/api/lakes';

  clusterAdded = new Subject<boolean>();
  clusterAdded$ = this.clusterAdded.asObservable();

  constructor(
    private http:Http
  ) {}

  list(): Observable<Lake[]> {
    return this.http
      .get(this.url, new RequestOptions(HttpUtil.getHeaders()))
      .map(HttpUtil.extractData)
      .catch(HttpUtil.handleError);
  }

  insert(lake: Lake): Observable<Lake> {
    return this.http
      .post(`${this.url}`, lake, new RequestOptions(HttpUtil.getHeaders()))
      .map(HttpUtil.extractData)
      .catch(HttpUtil.handleError);
  }

  update(lake: Lake): Observable<Lake> {
    return this.http
      .put(`${this.url}`, lake, new RequestOptions(HttpUtil.getHeaders()))
      .map(HttpUtil.extractData)
      .catch(HttpUtil.handleError);
  }

  retrieve(lakeId: string): Observable<Lake> {
    return this.http
      .get(`${this.url}/${lakeId}`, new RequestOptions(HttpUtil.getHeaders()))
      .map(HttpUtil.extractData)
      .catch(HttpUtil.handleError);
  }

  getDiscoveredServices(lakeId: string): Observable<any[]> {
    return this.http
      .get(`${this.url}/${lakeId}/services`, new RequestOptions(HttpUtil.getHeaders()))
      .map(HttpUtil.extractData)
      .catch(HttpUtil.handleError);
  }


  listWithClusters(type: string = 'all'): Observable<{
    data: Lake,
    clusters: Cluster[]
  }[]> {
    return this.http
      .get(`/api/actions/clusters?type=${type}`, new RequestOptions(HttpUtil.getHeaders()))
      .map(HttpUtil.extractData)
      .catch(HttpUtil.handleError);
  }

  listWithClustersAndLocation(type: string = 'all'): Observable<{
    data: Lake,
    location: Location,
    clusters: Cluster[]
  }[]> {
    return this.http
      .get(`/api/actions/clustersWithLocation?type=${type}`, new RequestOptions(HttpUtil.getHeaders()))
      .map(HttpUtil.extractData)
      .catch(HttpUtil.handleError);
  }

  validate(ambariUrl: string): Observable<any> {
  return this.http
    .get(`${this.url}/ambari/status?url=${ambariUrl}`, new RequestOptions(HttpUtil.getHeaders()))
    .map(HttpUtil.extractData)
    .catch(HttpUtil.handleError);
  }

  getPairsMock(lakes, id:number) : Observable<{
      data: Lake,
      clusters: Cluster[],
      status : number
    }>{
      if(lakes.length === 1){
        return null;
      }
      let index = lakes.findIndex((lake)=>{return id === lake.data.id})
      if(index === lakes.length - 1){
        return Observable.of(lakes[index - 1]);
      }else{
        return Observable.of(lakes[index + 1]);
      }
    }

}
