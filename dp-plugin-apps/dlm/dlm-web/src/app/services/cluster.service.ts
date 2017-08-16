/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Http } from '@angular/http';
import { mapResponse, getUrlDomain } from 'utils/http-util';
import { Cluster } from 'models/cluster.model';

@Injectable()
export class ClusterService {

  private decorateCluster(cluster: Cluster): Cluster {
    return {
      ...cluster,
      ambariWebUrl: getUrlDomain(cluster.ambariurl)
    };
  }

  constructor(private http: Http) { }

  fetchClusters(): Observable<any> {
    return mapResponse(this.http.get('clusters'))
      .map(({clusters}) => ({
        ...clusters,
        clusters: clusters.map(this.decorateCluster)
      }));
  }

  /**
   * @deprecated
   */
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
