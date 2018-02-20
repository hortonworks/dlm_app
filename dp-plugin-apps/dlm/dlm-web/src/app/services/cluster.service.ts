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
import { HttpClient } from '@angular/common/http';
import { getUrlDomain } from 'utils/http-util';
import { Cluster } from 'models/cluster.model';
import { PolicyService } from 'services/policy.service';

@Injectable()
export class ClusterService {

  private decorateCluster(cluster: Cluster): Cluster {
    return {
      ...cluster,
      ambariWebUrl: getUrlDomain(cluster.ambariurl),
      idByDatacenter: PolicyService.makeClusterId(cluster.dataCenter, cluster.name)
    };
  }

  constructor(private httpClient: HttpClient) { }

  fetchClusters(): Observable<any> {
    return this.httpClient.get<any>('clusters')
      .map(({clusters}) => ({
        ...clusters,
        clusters: clusters.map(this.decorateCluster)
      }));
  }

  /**
   * @deprecated
   */
  fetchCluster(id: string): Observable<any> {
    return this.httpClient.get<any>(`clusters/${id}`);
  }

  fetchClustersStatuses(): Observable<any> {
    return this.httpClient.get<any>('clusters/status');
  }

  pairWith(cluster: any, pair: any): Observable<any> {
    return this.httpClient.post(`pair/${cluster.id}`, pair);
  }

  unpair(cluster: any): Observable<any> {
    return this.httpClient.delete(`pair/${cluster.id}`);
  }
}
