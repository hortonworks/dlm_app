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

import { Component, OnInit, ViewEncapsulation, OnDestroy, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { Store } from '@ngrx/store';
import { loadClusters } from 'actions/cluster.action';
import { loadPairings, createPairing } from 'actions/pairing.action';
import { ClusterPairing } from 'models/cluster-pairing.model';
import { Pairing } from 'models/pairing.model';
import { getClustersWithBeacon, getClustersWithBeaconConfigs } from 'selectors/cluster.selector';
import { getAllPairings, getProgress } from 'selectors/pairing.selector';
import * as fromRoot from 'reducers';
import { TranslateService } from '@ngx-translate/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Progress } from 'models/progress.model';
import { PairingsComponent } from '../../pairings.component';
import { NotificationService } from 'services/notification.service';
import { ModalDialogComponent } from 'common/modal-dialog/modal-dialog.component';
import { NOTIFICATION_TYPES } from 'constants/notification.constant';
import { PROGRESS_STATUS } from 'constants/status.constant';
import { ProgressState } from 'models/progress-state.model';
import { getMergedProgress } from 'selectors/progress.selector';
import { SERVICES } from 'constants/cluster.constant';
import { SERVICE_STATUS } from 'constants/status.constant';
import { CLUSTER_STATUS } from 'constants/status.constant';
import { cloneDeep } from 'utils/object-utils';
import { loadBeaconAdminStatus } from 'actions/beacon.action';
import { loadAmbariPrivileges } from 'actions/ambari.action';

const PAIR_REQUEST = '[CREATE PAIR] PAIR_REQUEST';
const CLUSTERS_REQUEST = '[CREATE PAIR] CLUSTERS_REQUEST';
const BEACON_ADMIN_REQUEST = '[CREATE PAIR] BEACON_ADMIN_REQUEST';
const AMBARI_PRIVILEGES_REQUEST = '[CREATE PAIR] AMBARI_PRIVILEGES_REQUEST';

@Component({
  selector: 'dlm-create-pairing',
  templateUrl: './create-pairing.component.html',
  styleUrls: ['./create-pairing.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class CreatePairingComponent implements OnInit, OnDestroy {
  firstSetClusters$: Observable<ClusterPairing[]>;
  pairings$: Observable<Pairing[]>;
  progress$: Observable<Progress>;
  overallProgress$: Observable<ProgressState>;
  firstSetClusters: ClusterPairing[];
  private secondSetClusters: ClusterPairing[];
  private pairings: Pairing[];
  private firstSetClustersPromise;
  private firstSetClustersSubscription$;
  private loadParamsSubscription$;
  private pairingsSubscription$;
  private progressSubscription$;
  progress: Progress;
  errorMessage = '';
  isPairingProgress = false;
  createPairingForm: FormGroup;
  selectedFirstCluster: ClusterPairing = null;
  selectedSecondCluster: ClusterPairing = null;
  @ViewChild('errorDialog') errorDialog: ModalDialogComponent;

  constructor(private store: Store<fromRoot.State>,
              private t: TranslateService,
              private formBuilder: FormBuilder,
              private router: Router,
              private route: ActivatedRoute,
              private notificationsService: NotificationService) {
    this.firstSetClusters$ = store.select(getClustersWithBeacon);
    this.pairings$ = store.select(getAllPairings);
    this.progress$ = store.select(getProgress);
  }

  ngOnInit() {
    this.createPairingForm = this.formBuilder.group({
      firstCluster: '',
      secondCluster: ''
    });
    this.store.dispatch(loadClusters(CLUSTERS_REQUEST));
    this.store.dispatch(loadPairings(PAIR_REQUEST));
    this.store.dispatch(loadBeaconAdminStatus({requestId: BEACON_ADMIN_REQUEST}));
    this.store.dispatch(loadAmbariPrivileges({requestId: AMBARI_PRIVILEGES_REQUEST}));
    this.overallProgress$ = this.store.select(getMergedProgress(
      PAIR_REQUEST, CLUSTERS_REQUEST, BEACON_ADMIN_REQUEST, AMBARI_PRIVILEGES_REQUEST
    ));
    this.pairingsSubscription$ = this.pairings$.subscribe(pairings => {
      this.pairings = pairings;
      // Select the first cluster again incase pairs did not load while selecting the first cluster from route params
      if (pairings.length && this.selectedFirstCluster) {
        this.onFirstClusterChange(this.selectedFirstCluster);
      }
    });
    this.progressSubscription$ = this.progress$.subscribe( progress => {
      this.progress = progress;
      if (progress && 'state' in progress) {
        if (progress.state === PROGRESS_STATUS.SUCCESS) {
          this.router.navigate(['pairings']);
        } else if (progress.state === PROGRESS_STATUS.FAILED) {
          this.isPairingProgress = false;
        }
      }
    });
    this.firstSetClustersPromise = new Promise( (resolve, reject) => {
      this.firstSetClustersSubscription$ = this.firstSetClusters$.subscribe(clusters => {
        this.firstSetClusters = this.setUnhealthyStatus(clusters);
        if (clusters.length) {
          resolve(clusters);
        }
      });
    });
    this.loadRouteParams();
  }

  loadRouteParams() {
    this.loadParamsSubscription$ = this.route.queryParams
      .subscribe( params => {
        const clusterId = params['firstClusterId'];
        if (clusterId) {
          const clusters$ = this.firstSetClustersPromise.then(firstClusters => {
            const clusters = firstClusters.filter(cluster => +cluster.id === +clusterId);
            if (clusters.length) {
              this.onFirstClusterChange(clusters[0]);
            }
          });
        }
      });
  }

  handleSubmit(createPairingForm: FormGroup) {
    this.isPairingProgress = true;
    const notification = {
      [NOTIFICATION_TYPES.SUCCESS]: {
        title: 'page.pairings.create.notification.success.title',
        body: 'page.pairings.create.notification.success.body',
      },
      [NOTIFICATION_TYPES.ERROR]: {
        title: 'page.pairings.create.notification.error.title'
      }
    };
    const requestPayload = [
      {
        clusterId: this.selectedFirstCluster.id,
        beaconUrl: PairingsComponent.getBeaconUrl(this.selectedFirstCluster)
      },
      {
        clusterId: this.selectedSecondCluster.id,
        beaconUrl: PairingsComponent.getBeaconUrl(this.selectedSecondCluster)
      }
    ];
    this.store.dispatch(createPairing(requestPayload, {notification}));
  }

  selectFirstCluster(cluster: ClusterPairing) {
    this.selectedFirstCluster = cluster;
  }

  selectSecondCluster(cluster: ClusterPairing) {
    this.selectedSecondCluster = cluster;
  }

  /**
   * Resets the selection on second cluster
   */
  resetSecondCluster() {
    this.selectedSecondCluster = null;
  }

  /**
   * Invoked when first cluster is selected / changed
   * @param cluster: ClusterPairing
   */
  onFirstClusterChange(cluster: ClusterPairing) {
    if (!this.isPairingProgress) {
      this.selectFirstCluster(cluster);
      this.resetSecondCluster();
      // Filter out the selected cluster from the list of clusters to be paired
      // Assign immutable copy of the filtered subset to secondSetClusters
      this.secondSetClusters = cloneDeep(this.firstSetClusters.filter(clust => clust.id !== cluster.id));
      const clusterPairIds = this.getClusterPairIds(cluster);
      // Set the disabled property of a cluster to true if the cluster is already paired with the selected cluster
      this.secondSetClusters.forEach(c => {
        c.disabled = clusterPairIds.indexOf(c.id) > -1;
        const neededBeaconAdminStatus = cluster.beaconAdminStatus.beaconAdminStatus;
        const existingBeaconAdminStatus = c.beaconAdminStatus.beaconAdminStatus;
        c.beaconIncompatible = neededBeaconAdminStatus.is10 && !existingBeaconAdminStatus.is10 ||
          !neededBeaconAdminStatus.is10 && existingBeaconAdminStatus.is10;
      });
      this.secondSetClusters = this.setUnhealthyStatus(this.secondSetClusters);
    }
  }

  /**
   * Set beaconUnhealthy and ambariUnhealthy value on each cluster in the clusters array passed
   * @param clusters
   */
  setUnhealthyStatus(clusters: ClusterPairing[]): ClusterPairing[] {
    clusters.forEach(clust => {
      const beaconStatus = clust.status.filter(status => status.service_name === SERVICES.BEACON);
      clust.beaconUnhealthy = (beaconStatus.length > 0) ? beaconStatus[0].state !== SERVICE_STATUS.STARTED : false;
      clust.ambariUnhealthy = clust.healthStatus === CLUSTER_STATUS.UNKNOWN;
      clust.lacksPrivilege = clust.privilege && clust.privilege.isConfigReadAuthEnabled === false;
    });
    return clusters;
  }

  /**
   * Returns an array of Pairing objects that are associated with the given cluster
   * @param cluster: ClusterPairing
   * @returns {Pairing[]}
   */
  getClusterPairings(cluster: ClusterPairing): Pairing[] {
    return this.pairings.filter( pairing => pairing.pair.filter(pair => +pair.id === +cluster.id).length );
  }

  /**
   * Returns an array of paired cluster ids of the given cluster
   * @param cluster: ClusterPairing
   * @returns {number[]}
   */
  getClusterPairIds(cluster: ClusterPairing): number[] {
    const pairings = this.getClusterPairings(cluster);
    const pairs = pairings.map( pairing => pairing.pair );
    const flattened = [].concat.apply([], pairs);
    const filtered = flattened.filter( clust => clust.id !== cluster.id);
    return filtered.map( clust => clust.id);
  }

  ngOnDestroy() {
    this.loadParamsSubscription$.unsubscribe();
    this.pairingsSubscription$.unsubscribe();
    this.firstSetClustersSubscription$.unsubscribe();
    this.progressSubscription$.unsubscribe();
  }
}
