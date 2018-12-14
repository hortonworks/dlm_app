/*
 * HORTONWORKS DATAPLANE SERVICE AND ITS CONSTITUENT SERVICES
 *
 * (c) 2016-2018 Hortonworks, Inc. All rights reserved.
 *
 * This code is provided to you pursuant to your written agreement with Hortonworks, which may be the terms
 * of the Affero General Public License version 3 (AGPLv3), or pursuant to a written agreement with a third party
 * authorized to distribute this code.  If you do not have a written agreement with Hortonworks or with
 * an authorized and properly licensed third party, you do not have any rights to this code.
 *
 * If this code is provided to you under the terms of the AGPLv3: A) HORTONWORKS PROVIDES THIS CODE TO YOU
 * WITHOUT WARRANTIES OF ANY KIND; (B) HORTONWORKS DISCLAIMS ANY AND ALL EXPRESS AND IMPLIED WARRANTIES WITH
 * RESPECT TO THIS CODE, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF TITLE, NON-INFRINGEMENT, MERCHANTABILITY
 * AND FITNESS FOR A PARTICULAR PURPOSE; (C) HORTONWORKS IS NOT LIABLE TO YOU, AND WILL NOT DEFEND, INDEMNIFY,
 * OR HOLD YOU HARMLESS FOR ANY CLAIMS ARISING FROM OR RELATED TO THE CODE; AND (D) WITH RESPECT
 * TO YOUR EXERCISE OF ANY RIGHTS GRANTED TO YOU FOR THE CODE, HORTONWORKS IS NOT LIABLE FOR ANY DIRECT,
 * INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, PUNITIVE OR CONSEQUENTIAL DAMAGES INCLUDING, BUT NOT LIMITED TO,
 * DAMAGES RELATED TO LOST REVENUE, LOST PROFITS, LOSS OF INCOME, LOSS OF BUSINESS ADVANTAGE OR UNAVAILABILITY,
 * OR LOSS OR CORRUPTION OF DATA.
 */


import {map} from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Cluster } from 'models/cluster.model';
import { PolicyService } from 'services/policy.service';
import { StaleClustersResponse } from 'models/stale-cluster.model';

@Injectable()
export class ClusterService {

  /**
   *
   * @param {string} version Example: `HDP-2.6.5.0`
   * @param {string} majorVersion Example: 'HDP-2.6'
   * @returns {string}
   */
  private stackDisplayVersion(version: string, majorVersion: string): string {
    if (!version) { return majorVersion; }
    const stackInfo = version.split('-');
    const versionNumber = stackInfo[1].split('.').slice(0, 3).join('.');
    return [stackInfo[0], versionNumber].join('-');
  }

  private decorateCluster(cluster: Cluster): Cluster {
    return {
      ...cluster,
      stackDisplayVersion: this.stackDisplayVersion(cluster.stackVersion, cluster.stackMajorVersion),
      idByDatacenter: PolicyService.makeClusterId(cluster.dataCenter, cluster.name)
    };
  }

  constructor(private httpClient: HttpClient) { }

  fetchClusters(): Observable<any> {
    return this.httpClient.get<any>('clusters').pipe(
      map(({clusters}) => ({
        ...clusters,
        clusters: clusters.map(this.decorateCluster, this)
      })));
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

  submitCluster(id: number): Observable<any> {
    return this.httpClient.post(`clusters/create/local/${id}`, null);
  }

  fetchStaleClusters(): Observable<StaleClustersResponse> {
    return this.httpClient.get<StaleClustersResponse>('clusters/beacon/stale/status');
  }

  syncCluster(id: number): Observable<any> {
    return this.httpClient.put(`clusters/sync/${id}`, null);
  }
}
