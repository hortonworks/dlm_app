import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { Store } from '@ngrx/store';
import { LoadClusters } from 'actions/cluster.action';
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

@Component({
  selector: 'dlm-create-pairing',
  templateUrl: './create-pairing.component.html',
  styleUrls: ['./create-pairing.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class CreatePairingComponent implements OnInit {
  firstSetClusters$: Observable<ClusterPairing[]>;
  pairings$: Observable<Pairing[]>;
  progress$: Observable<Progress>;
  private firstSetClusters: ClusterPairing[];
  private secondSetClusters: ClusterPairing[];
  private pairings: Pairing[];
  progress: Progress;
  isPairingProgress = false;
  createPairingForm: FormGroup;
  selectedFirstCluster: ClusterPairing = null;
  selectedSecondCluster: ClusterPairing = null;

  constructor(private store: Store<fromRoot.State>,
              t: TranslateService,
              private formBuilder: FormBuilder,
              private router: Router) {
    this.firstSetClusters$ = store.select(getAllClusters);
    this.pairings$ = store.select(getAllPairings);
    this.progress$ = store.select(getProgress);
  }

  ngOnInit() {
    this.createPairingForm = this.formBuilder.group({
      firstCluster: '',
      secondCluster: ''
    });
    this.store.dispatch(new LoadClusters());
    this.store.dispatch(loadPairings());
    this.pairings$.subscribe(pairings => this.pairings = pairings);
    this.firstSetClusters$.subscribe(clusters => this.firstSetClusters = clusters);
    this.progress$.subscribe( progress => this.progress = progress);
  }

  handleSubmit(createPairingForm: FormGroup) {
    console.log(createPairingForm);
    this.isPairingProgress = true;
    const requestPayload = [
      {
        clusterId: this.selectedFirstCluster.id,
        beaconUrl: this.getBeaconUrl(this.selectedFirstCluster)
      },
      {
        clusterId: this.selectedSecondCluster.id,
        beaconUrl: this.getBeaconUrl(this.selectedSecondCluster)
      }
    ];
    this.store.dispatch(createPairing(requestPayload));
  }

  getBeaconUrl(cluster: ClusterPairing): string {
    let beaconUrl = '';
    if (cluster.services && cluster.services.length) {
      const beaconService = cluster.services.filter(service => service.servicename === 'BEACON_SERVER');
      if (beaconService.length) {
        beaconUrl = beaconService[0].fullURL;
      }
    }
    return beaconUrl;
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
    return this.pairings.filter( pairing => pairing.pair.filter(pair => pair.id === cluster.id).length );
  }

  /**
   * Returns an array of paired cluster ids of the given cluster
   * @param cluster: ClusterPairing
   * @returns {string[]}
   */
  getClusterPairIds(cluster: ClusterPairing): string[] {
    const pairings = this.getClusterPairings(cluster);
    const pairs = pairings.map( pairing => pairing.pair );
    const flattened = [].concat.apply([], pairs);
    const filtered = flattened.filter( clust => clust.id !== cluster.id);
    return filtered.map( clust => clust.id);
  }

  onConfirmation() {
    this.router.navigate(['pairings']);
  }
}
