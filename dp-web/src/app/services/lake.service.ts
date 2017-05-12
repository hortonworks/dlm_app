import { Injectable } from '@angular/core';
import { Http, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs/Observable';

import { Lake } from '../models/lake';
import { Cluster } from '../models/cluster';

import { HttpUtil } from '../shared/utils/httpUtil';


@Injectable()
export class LakeService {
  url = '/api/lakes';

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

  retrieve(lakeId: string): Observable<Lake> {
    return this.http
      .get(`${this.url}/${lakeId}`, new RequestOptions(HttpUtil.getHeaders()))
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

  listWithClusters(): Observable<{
    data: Lake,
    clusters: Cluster[]
  }[]> {
    return this.http
      .get('/api/actions/lakes-list-with-clusters', new RequestOptions(HttpUtil.getHeaders()))
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
