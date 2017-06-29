import {Injectable} from '@angular/core';
import {Http, Headers, RequestOptions} from '@angular/http';
import {Observable} from 'rxjs/Observable';
import {Cluster, ClusterHealthSummary} from '../models/cluster';
import {ClusterDetailRequest} from '../models/cluster-state';
import {HttpUtil} from '../shared/utils/httpUtil';

@Injectable()
export class ClusterService {
  uri = '/api/clusters';

  constructor(private http:Http) { }

  listByLakeId({ lakeId }): Observable<Cluster[]>{
    const uri = lakeId ? `${this.uri}?lakeId=${lakeId}` : this.uri;
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

  retrieveHealth(clusterId: number, dpClusterId: number): Observable<ClusterHealthSummary>  {
    const uri = `${this.uri}/${clusterId}/health?dpClusterId=${dpClusterId}&summary=true`;

    return this.http
      .get(uri, new RequestOptions(HttpUtil.getHeaders()))
      .map(HttpUtil.extractData)
      .catch(HttpUtil.handleError);
  }

  retrieveDetailedHealth(clusterId: number, dpClusterId: number): Observable<any> {
    const uri = `${this.uri}/${clusterId}/health?dpClusterId=${dpClusterId}`;
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

  getClusterInfo(clusterDetailRequest:ClusterDetailRequest) :Observable<Cluster> {
    return this.http
      .post(`api/clusters/details`,clusterDetailRequest, new RequestOptions(HttpUtil.getHeaders()))
      .map(HttpUtil.extractData)
      .catch(HttpUtil.handleError);
  }

}
