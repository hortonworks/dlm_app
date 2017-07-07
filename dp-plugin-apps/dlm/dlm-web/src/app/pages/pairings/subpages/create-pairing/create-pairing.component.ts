import { Component, OnInit, ViewEncapsulation, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { Store } from '@ngrx/store';
import { loadClusters } from 'actions/cluster.action';
import { loadPairings, createPairing } from 'actions/pairing.action';
import { ClusterPairing } from 'models/cluster-pairing.model';
import { Pairing } from 'models/pairing.model';
import { getAllClusters } from 'selectors/cluster.selector';
import { getAllPairings, getProgress } from 'selectors/pairing.selector';
import * as fromRoot from 'reducers';
import { TranslateService } from '@ngx-translate/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Progress } from 'models/progress.model';
import { fromJS } from 'immutable';
import { PairingsComponent } from '../../pairings.component';
import { NotificationService } from 'services/notification.service';
import { NOTIFICATION_TYPES } from 'constants/notification.constant';
import { ToastNotification } from 'models/toast-notification.model';

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
  private firstSetClusters: ClusterPairing[];
  private secondSetClusters: ClusterPairing[];
  private pairings: Pairing[];
  private firstSetClustersPromise;
  private firstSetClustersSubscription$;
  private loadParamsSubscription$;
  private pairingsSubscription$;
  private progressSubscription$;
  progress: Progress;
  isPairingProgress = false;
  createPairingForm: FormGroup;
  selectedFirstCluster: ClusterPairing = null;
  selectedSecondCluster: ClusterPairing = null;

  constructor(private store: Store<fromRoot.State>,
              private t: TranslateService,
              private formBuilder: FormBuilder,
              private router: Router,
              private route: ActivatedRoute,
              private notificationsService: NotificationService) {
    this.firstSetClusters$ = store.select(getAllClusters);
    this.pairings$ = store.select(getAllPairings);
    this.progress$ = store.select(getProgress);
  }

  ngOnInit() {
    this.createPairingForm = this.formBuilder.group({
      firstCluster: '',
      secondCluster: ''
    });
    this.store.dispatch(loadClusters());
    this.store.dispatch(loadPairings());
    this.pairingsSubscription$ = this.pairings$.subscribe(pairings => {
      this.pairings = pairings;
      // Select the first cluster again incase pairs did not load while selecting the first cluster from route params
      if (pairings.length && this.selectedFirstCluster) {
        this.onFirstClusterChange(this.selectedFirstCluster);
      }
    });
    this.progressSubscription$ = this.progress$.subscribe( progress => {
      this.progress = progress;
      if (progress && 'state' in progress && progress.state === 'success') {
        this.router.navigate(['pairings']);
        this.notificationsService.create(<ToastNotification>{
          title: this.t.instant('page.pairings.create.confirmation.title'),
          body: this.t.instant('page.pairings.create.confirmation.body'),
          type: NOTIFICATION_TYPES.SUCCESS
        });
      }
    });
    this.firstSetClustersPromise = new Promise( (resolve, reject) => {
      this.firstSetClustersSubscription$ = this.firstSetClusters$.subscribe(clusters => {
        this.firstSetClusters = clusters;
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
    this.store.dispatch(createPairing(requestPayload));
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
      this.secondSetClusters = fromJS(this.firstSetClusters.filter(clust => clust.id !== cluster.id)).toJS();
      const clusterPairIds = this.getClusterPairIds(cluster);
      // Set the disabled property of a cluster to true if the cluster is already paired with the selected cluster
      this.secondSetClusters.forEach(clust => {
        clust.disabled = clusterPairIds.indexOf(clust.id) > -1;
      });
    }
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
