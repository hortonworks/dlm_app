import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Http } from '@angular/http';

@Injectable()
export class ClusterService {

  constructor(private http: Http) { }

  fetchClusters(): Observable<any> {
    return this.http.get('clusters').map(r => r.json());
  }

  getCluster(id: string): Observable<any> {
    return this.http.get(`cluster/${id}`).map(r => r.json());
  }

  pairWith(cluster: any, pair: any): Observable<any> {
    return this.http.post(`pair/${cluster.id}`, pair).map(r => r.json());
  }

  unpair(cluster: any): Observable<any> {
    return this.http.delete(`pair/${cluster.id}`);
  }
}
