import {Injectable} from '@angular/core';
import {Http, Headers, RequestOptions} from '@angular/http';
import {Observable} from 'rxjs/Observable';
import {Cluster, ClusterHealthSummary} from '../models/cluster';
import {HttpUtil} from '../shared/utils/httpUtil';

@Injectable()
export class ClusterService {
  uri = '/api/clusters';

  constructor(private http:Http) { }

  list({ lakeId }): Observable<Cluster[]>{
    const uri = lakeId ? `${this.uri}?lakeId=${lakeId}` : this.uri;
    return this.http
      .get(uri, new RequestOptions(HttpUtil.getHeaders()))
      .map(HttpUtil.extractData)
      .catch(HttpUtil.handleError);
  }

  insert(cluster: Cluster): Observable<Cluster> {
    return this.http
      .post(`${this.uri}`, cluster, new RequestOptions(HttpUtil.getHeaders()))
      .map(HttpUtil.extractData)
      .catch(HttpUtil.handleError);
  }

  validate(clusterUrl: string): Observable<boolean> {
    // TODO: implement
    return Observable.of(true);
  }

  retrieveHealth(clusterId: number): Observable<ClusterHealthSummary>  {
    const uri = `${this.uri}/${clusterId}/health?summary=true`;

    return this.http
      .get(uri, new RequestOptions(HttpUtil.getHeaders()))
      .map(HttpUtil.extractData)
      .catch(HttpUtil.handleError);
  }

}