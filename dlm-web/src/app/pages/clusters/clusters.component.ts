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

import { Component, OnDestroy, OnInit } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Store } from '@ngrx/store';
import { loadClusters, loadClustersStatuses } from 'actions/cluster.action';
import { loadPairings } from 'actions/pairing.action';
import { loadPolicies } from 'actions/policy.action';
import { Cluster } from 'models/cluster.model';
import { PairsCountEntity } from 'models/pairs-count-entity.model';
import { PoliciesCountEntity } from 'models/policies-count-entity.model';
import { getClustersWithLowCapacity, getClustersWithBeacon } from 'selectors/cluster.selector';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { getCountPairsForClusters } from 'selectors/pairing.selector';
import { getAllPoliciesWithClusters, getCountPoliciesForSourceClusters } from 'selectors/policy.selector';
import * as fromRoot from 'reducers';
import { TranslateService } from '@ngx-translate/core';
import { MapSize, ClusterMapData, ClusterMapPoint, ClusterMapEntity } from 'models/map-data';
import { ProgressState } from 'models/progress-state.model';
import { Subscription } from 'rxjs/Subscription';
import { Policy } from 'models/policy.model';
import { CLUSTER_STATUS, SERVICE_STATUS } from 'constants/status.constant';
import { ALL_POLICIES_COUNT } from 'constants/api.constant';
import { loadBeaconAdminStatus } from 'actions/beacon.action';
import { ClusterService } from 'services/cluster.service';
import { AsyncActionsService } from 'services/async-actions.service';
import { AvailableEntityActions, getAvailableEntityActions } from 'selectors/operation.selector';
import { loadAccounts } from 'actions/cloud-account.action';

@Component({
  selector: 'dlm-clusters',
  templateUrl: './clusters.component.html',
  styleUrls: ['./clusters.component.scss']
})
export class ClustersComponent implements OnInit, OnDestroy {
  tableData$: Observable<Cluster[]>;
  clustersMapData$: Observable<ClusterMapData[]>;
  overallProgress$: Observable<ProgressState>;
  overallProgressSubscription$: Subscription;
  resourceAvailability$: Observable<AvailableEntityActions>;
  mapSize: MapSize = MapSize.FULLWIDTH;
  clusterLegend$: Observable<any>;
  policies$: Observable<Policy[]>;
  lowCapacityClusters$: Observable<Cluster[]>;
  selectedCluster$ = new BehaviorSubject<null|Cluster>(null);
  submittedClusters: {[id: number]: boolean} = {};

  constructor(private store: Store<fromRoot.State>,
              t: TranslateService,
              clusterService: ClusterService,
              asyncActions: AsyncActionsService) {
    const clusters$: Observable<Cluster[]> = store.select(getClustersWithBeacon);
    const pairsCount$: Observable<PairsCountEntity> = store.select(getCountPairsForClusters);
    const policiesCount$: Observable<PoliciesCountEntity> = store.select(getCountPoliciesForSourceClusters);
    const allResources$ = Observable.combineLatest(clusters$, pairsCount$, policiesCount$);
    this.overallProgress$ = Observable.of({ isInProgress: true } as ProgressState)
      .merge(Observable.forkJoin([
        loadClusters(),
        loadPairings(),
        loadPolicies({numResults: ALL_POLICIES_COUNT})
      ].map(action => asyncActions.dispatch(action)))
      .map(results => results[0]));
    this.lowCapacityClusters$ = store.select(getClustersWithLowCapacity);
    this.policies$ = store.select(getAllPoliciesWithClusters);
    this.overallProgressSubscription$ = this.overallProgress$
      .filter(p => p.isInProgress === false)
      .withLatestFrom(allResources$)
      .subscribe(([progress, [clusters, pairsCount]]) => {
        this.submittedClusters = clusters.reduce((acc, cluster) => ({
          ...acc,
          [cluster.id]: cluster.id in pairsCount && pairsCount[cluster.id].pairs > 0
        }), {});
        Object.keys(this.submittedClusters).forEach(clusterId => {
          const id = +clusterId;
          if (this.submittedClusters[id] === false) {
            clusterService.submitCluster(id)
              .subscribe(__ => this.updateSubmittedCluster(id, true), __ => this.updateSubmittedCluster(id, false));
          }
        });
        if (progress.success) {
          this.store.dispatch(loadClustersStatuses());
        }
      });
    this.tableData$ = allResources$
      .map(([clusters, pairsCount, policiesCount]) => {
        return clusters.map(cluster => {
          const pairsCounter = cluster.id in pairsCount &&
          'pairs' in pairsCount[cluster.id] ? pairsCount[cluster.id].pairs : 0;
          const policiesCounter = cluster.id in policiesCount &&
          'policies' in policiesCount[cluster.id] ? policiesCount[cluster.id].policies : 0;
          return {
            ...cluster,
            pairsCounter,
            policiesCounter
          };
        });
      });
    this.clustersMapData$ = Observable
      .combineLatest(clusters$, store.select(getCountPoliciesForSourceClusters), this.lowCapacityClusters$)
      .startWith([[], [], []])
      .map(([clusters, policiesCount, lowCapacityClusters]) => this.makeClustersMapData(clusters, policiesCount, lowCapacityClusters));
    this.resourceAvailability$ = store.select(getAvailableEntityActions);
    this.clusterLegend$ = Observable
      .combineLatest(this.clustersMapData$, this.selectedCluster$, this.policies$)
      .map(([clustersMapData, selectedCluster, policies]) => {
        if (!selectedCluster) {
          return false;
        }
        const cluster = clustersMapData.find(c => c.start.cluster.id === selectedCluster.id).start.cluster;
        return {
          ...cluster,
          alerts: cluster.status.filter(service => service.state !== SERVICE_STATUS.STARTED)
        };
      });
  }

  private makeClustersMapData(clusters, policiesCount, lowCapacityClusters) {
    return clusters.map(cluster => {
      const policiesCounter = cluster.id in policiesCount &&
      'policies' in policiesCount[cluster.id] ? policiesCount[cluster.id].policies : 0;
      // prioritize UNHEALTHY status over WARNING when display cluster dot marker
      const healthStatus = lowCapacityClusters.some(c => c.id === cluster.id) && cluster.healthStatus !== CLUSTER_STATUS.UNHEALTHY ?
        CLUSTER_STATUS.WARNING : cluster.healthStatus;
      const clusterData = <ClusterMapEntity>{
        ...cluster,
        healthStatus,
        policiesCounter
      };
      return <ClusterMapData>{start: <ClusterMapPoint>{cluster: clusterData}};
    });
  }

  private updateSubmittedCluster(clusterId: number, submitted: boolean) {
    this.submittedClusters = {
      ...this.submittedClusters,
      [clusterId]: submitted
    };
  }

  ngOnInit() {
    this.store.dispatch(loadBeaconAdminStatus());
    this.store.dispatch(loadAccounts());
  }

  handleClickMarker(clusters: Cluster[]): void {
    const selectedCluster = this.selectedCluster$.getValue();
    if (this.selectedCluster$.getValue() && clusters.some(c => c.id === selectedCluster.id)) {
      const selectedIndex = clusters.findIndex(c => c.id === selectedCluster.id);
      const nextCluster = selectedIndex > -1 && clusters[selectedIndex + 1] || clusters[0];
      this.selectedCluster$.next(nextCluster);
      return;
    }
    this.selectedCluster$.next(clusters[0]);
  }

  handleLegendClose() {
    this.selectedCluster$.next(null);
  }

  ngOnDestroy() {
    this.overallProgressSubscription$.unsubscribe();
  }
}
