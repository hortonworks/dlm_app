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
import { Observable, BehaviorSubject, Subscription, of, merge, forkJoin, combineLatest ,   } from 'rxjs';
import { Store } from '@ngrx/store';
import { map, shareReplay, filter, withLatestFrom, startWith } from 'rxjs/operators';

import { loadClusters, loadClustersStatuses, loadStaleClusters, syncCluster } from 'actions/cluster.action';
import { loadPairings } from 'actions/pairing.action';
import { loadPolicies } from 'actions/policy.action';
import { Cluster } from 'models/cluster.model';
import { PairsCountEntity } from 'models/pairs-count-entity.model';
import { PoliciesCountEntity } from 'models/policies-count-entity.model';
import { getClustersWithLowCapacity, getClustersWithBeacon } from 'selectors/cluster.selector';
import { getCountPairsForClusters } from 'selectors/pairing.selector';
import { getAllPoliciesWithClusters, getCountPoliciesForSourceClusters } from 'selectors/policy.selector';
import * as fromRoot from 'reducers';
import { TranslateService } from '@ngx-translate/core';
import { MapSize, ClusterMapData, ClusterMapPoint, ClusterMapEntity } from 'models/map-data';
import { ProgressState } from 'models/progress-state.model';
import { Policy } from 'models/policy.model';
import { CLUSTER_STATUS, SERVICE_STATUS } from 'constants/status.constant';
import { loadBeaconAdminStatus } from 'actions/beacon.action';
import { ClusterService } from 'services/cluster.service';
import { AsyncActionsService } from 'services/async-actions.service';
import { AvailableEntityActions, getAvailableEntityActions } from 'selectors/operation.selector';
import { loadAccounts } from 'actions/cloud-account.action';
import { PageComponent } from 'pages/page.component';
import { StaleCluster } from 'models/stale-cluster.model';
import { getAllStaleClusters } from 'selectors/stale-cluster.selector';
import { DlmPropertiesService } from 'services/dlm-properties.service';
import { NOTIFICATION_TYPES, NOTIFICATION_CONTENT_TYPE } from 'constants/notification.constant';
import { UserService } from 'services/user.service';

@Component({
  selector: 'dlm-clusters',
  templateUrl: './clusters.component.html',
  styleUrls: ['./clusters.component.scss']
})
export class ClustersComponent extends PageComponent implements OnInit, OnDestroy {
  tableData$: Observable<Cluster[]>;
  clustersMapData$: Observable<ClusterMapData[]>;
  overallProgress$: Observable<ProgressState>;
  resourceAvailability$: Observable<AvailableEntityActions>;
  mapSize: MapSize = MapSize.FULLWIDTH;
  clusterLegend$: Observable<any>;
  policies$: Observable<Policy[]>;
  lowCapacityClusters$: Observable<Cluster[]>;
  selectedCluster$ = new BehaviorSubject<null|Cluster>(null);
  submittedClusters: {[id: number]: boolean} = {};
  staleClusters$: Observable<StaleCluster[]>;
  subscriptions: Subscription[] = [];
  // Default policies query count is updated from dlm properties API
  policiesQueryCount = 0;
  syncInProgress = new Set();

  constructor(private store: Store<fromRoot.State>,
              private t: TranslateService,
              clusterService: ClusterService,
              private dlmPropertiesService: DlmPropertiesService,
              private asyncActions: AsyncActionsService,
              public userService: UserService) {
    super();
    const clusters$: Observable<Cluster[]> = store.select(getClustersWithBeacon);
    const pairsCount$: Observable<PairsCountEntity> = store.select(getCountPairsForClusters);
    const policiesCount$: Observable<PoliciesCountEntity> = store.select(getCountPoliciesForSourceClusters);
    const allResources$ = combineLatest(clusters$, pairsCount$, policiesCount$);
    const policiesCountSubscription = this.dlmPropertiesService.getPoliciesQueryCount$()
      .subscribe(count => this.policiesQueryCount = count);
    this.staleClusters$ = store.select(getAllStaleClusters);
    this.overallProgress$ = merge(
      of({ isInProgress: true } as ProgressState),
      forkJoin([
        loadClusters(),
        loadPairings(),
        loadPolicies({numResults: this.policiesQueryCount})
      ].map(action => asyncActions.dispatch(action))).pipe(
        map(results => results[0]))
      ).pipe(shareReplay());
    this.lowCapacityClusters$ = store.select(getClustersWithLowCapacity);
    this.policies$ = store.select(getAllPoliciesWithClusters);
    const overallProgressSubscription = this.overallProgress$
      .pipe(
        filter(p => p.isInProgress === false),
        withLatestFrom(allResources$)
      ).subscribe(([progress, [clusters, pairsCount]]) => {
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
          this.store.dispatch(loadStaleClusters());
        }
      });
    this.tableData$ = allResources$
      .pipe(
        map(([clusters, pairsCount, policiesCount]) => {
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
        })
      );
    this.clustersMapData$ = combineLatest(clusters$, store.select(getCountPoliciesForSourceClusters), this.lowCapacityClusters$).pipe(
      startWith([[], [], []]),
      map(([clusters, policiesCount, lowCapacityClusters]) => this.makeClustersMapData(clusters, policiesCount, lowCapacityClusters))
    );
    this.resourceAvailability$ = store.select(getAvailableEntityActions);
    this.clusterLegend$ = combineLatest(this.clustersMapData$, this.selectedCluster$, this.policies$).pipe(
      map(([clustersMapData, selectedCluster, policies]) => {
        if (!selectedCluster) {
          return false;
        }
        const cluster = clustersMapData.find(c => c.start.cluster.id === selectedCluster.id).start.cluster;
        return {
          ...cluster,
          alerts: cluster.status.filter(service => service.state !== SERVICE_STATUS.STARTED)
        };
      })
    );
    this.subscriptions.push(policiesCountSubscription);
    this.subscriptions.push(overallProgressSubscription);
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
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  handleClusterSync(cluster: Cluster) {
    const actionTranslate = 'common.action_notifications.sync_cluster';
    const notification = {
      [NOTIFICATION_TYPES.SUCCESS]: {
        title: `${actionTranslate}.success.title`,
        body: this.t.instant(`${actionTranslate}.success.body`, {
          clusterName: cluster.name
        })
      },
      [NOTIFICATION_TYPES.ERROR]: {
        title: `${actionTranslate}.error.title`,
        contentType: NOTIFICATION_CONTENT_TYPE.MODAL_LINK
      },
      [NOTIFICATION_TYPES.UNREACHABLE_BEACON]: {
        title: `${actionTranslate}.warning.title`
      },
      levels: [NOTIFICATION_TYPES.UNREACHABLE_BEACON, NOTIFICATION_TYPES.SUCCESS, NOTIFICATION_TYPES.ERROR]
    };
    this.syncInProgress = new Set(this.syncInProgress);
    this.syncInProgress.add(cluster.id);
    this.asyncActions.dispatch(syncCluster(cluster.id, { notification })).subscribe(progressState => {
      this.syncInProgress = new Set(this.syncInProgress);
      this.syncInProgress.delete(cluster.id);
      if (!progressState.error) {
        this.asyncActions.dispatch(loadStaleClusters());
      }
    });
  }
}
