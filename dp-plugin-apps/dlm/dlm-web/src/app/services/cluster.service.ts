import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Http } from '@angular/http';
import { mapResponse } from 'utils/http-util';
import { Cluster } from 'models/cluster.model';

@Injectable()
export class ClusterService {

  normalizeCluster(cluster: Cluster): Cluster {
    cluster.dataCenter = cluster.name;
    return cluster;
  }

  constructor(private http: Http) { }

  fetchClusters(): Observable<any> {
    return mapResponse(this.http.get('clusters')).map(response => {
      response.clusters.map( cluster => {
        return {
          ...cluster,
          ...this.normalizeCluster(cluster)
        };
      });
      return response;
    });
  }

  fetchCluster(id: string): Observable<any> {
    return mapResponse(this.http.get(`clusters/${id}`)).map(response => {
      response.clusters.map( cluster => {
        return {
          ...cluster,
          ...this.normalizeCluster(cluster)
        };
      });
      return response;
    });
  }

  pairWith(cluster: any, pair: any): Observable<any> {
    return this.http.post(`pair/${cluster.id}`, pair).map(r => r.json());
  }

  unpair(cluster: any): Observable<any> {
    return this.http.delete(`pair/${cluster.id}`);
  }
}
