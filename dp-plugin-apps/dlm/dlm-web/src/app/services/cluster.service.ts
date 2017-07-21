import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Http } from '@angular/http';
import { mapResponse } from 'utils/http-util';
import { Cluster } from 'models/cluster.model';

@Injectable()
export class ClusterService {

  constructor(private http: Http) { }

  fetchClusters(): Observable<any> {
    return mapResponse(this.http.get('clusters'));
  }

  fetchCluster(id: string): Observable<any> {
    return mapResponse(this.http.get(`clusters/${id}`));
  }

  fetchClustersStatuses(): Observable<any> {
    return mapResponse(this.http.get('clusters/status'));
  }

  pairWith(cluster: any, pair: any): Observable<any> {
    return this.http.post(`pair/${cluster.id}`, pair).map(r => r.json());
  }

  unpair(cluster: any): Observable<any> {
    return this.http.delete(`pair/${cluster.id}`);
  }
}
