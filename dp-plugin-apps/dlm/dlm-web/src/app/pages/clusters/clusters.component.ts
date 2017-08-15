/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
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
import { getAllClusters, getClustersWithLowCapacity } from 'selectors/cluster.selector';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { getCountPairsForClusters } from 'selectors/pairing.selector';
import { getAllPoliciesWithClusters, getCountPoliciesForSourceClusters } from 'selectors/policy.selector';
import * as fromRoot from 'reducers';
import { TranslateService } from '@ngx-translate/core';
import { MapSize, ClusterMapData, ClusterMapPoint } from 'models/map-data';
import { AddEntityButtonComponent } from 'components/add-entity-button/add-entity-button.component';
import { ProgressState } from 'models/progress-state.model';
import { getMergedProgress } from 'selectors/progress.selector';
import { Subscription } from 'rxjs/Subscription';
import { isEqual } from 'utils/object-utils';
import { Policy } from 'models/policy.model';
import { CLUSTER_STATUS, SERVICE_STATUS } from 'constants/status.constant';

const CLUSTERS_REQUEST_ID = '[CLUSTER_PAGE]CLUSTERS_REQUEST_ID';
const POLICIES_REQUEST_ID = '[CLUSTER_PAGE]POLICIES_REQUEST_ID';
const PAIRINGS_REQUEST_ID = '[CLUSTER_PAGE]PAIRINGS_REQUEST_ID';

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
  resourceAvailability$: Observable<{canAddPolicy: boolean, canAddPairing: boolean}>;
  mapSize: MapSize = MapSize.FULLWIDTH;
  clusterLegend$: Observable<any>;
  policies$: Observable<Policy[]>;
  lowCapacityClusters$: Observable<Cluster[]>;
  selectedCluster$ = new BehaviorSubject<null|Cluster>(null);

  constructor(private store: Store<fromRoot.State>, t: TranslateService) {
    const clusters$: Observable<Cluster[]> = store.select(getAllClusters);
    const pairsCount$: Observable<PairsCountEntity> = store.select(getCountPairsForClusters);
    const policiesCount$: Observable<PoliciesCountEntity> = store.select(getCountPoliciesForSourceClusters);
    const allResources$ = Observable.combineLatest(clusters$, pairsCount$, policiesCount$);
    this.overallProgress$ = store.select(getMergedProgress(CLUSTERS_REQUEST_ID, POLICIES_REQUEST_ID, PAIRINGS_REQUEST_ID));
    this.lowCapacityClusters$ = this.store.select(getClustersWithLowCapacity);
    this.policies$ = store.select(getAllPoliciesWithClusters);
    this.overallProgressSubscription$ = this.overallProgress$.distinctUntilChanged(isEqual).subscribe(progress => {
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
    this.resourceAvailability$ = Observable
      .combineLatest(clusters$, pairsCount$)
      .map(AddEntityButtonComponent.availableActions);
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
      const clusterData = {
        ...cluster,
        healthStatus,
        policiesCounter
      };
      return <ClusterMapData>{start: <ClusterMapPoint>{cluster: clusterData}};
    });
  }

  ngOnInit() {
    this.store.dispatch(loadClusters(CLUSTERS_REQUEST_ID));
    this.store.dispatch(loadPairings(PAIRINGS_REQUEST_ID));
    this.store.dispatch(loadPolicies(POLICIES_REQUEST_ID));
  }

  handleClickMarker(cluster: Cluster) {
    this.selectedCluster$.next(cluster);
  }

  ngOnDestroy() {
    this.overallProgressSubscription$.unsubscribe();
  }
}
