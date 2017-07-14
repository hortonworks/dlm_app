import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { loadPairings, deletePairing } from 'actions/pairing.action';
import { Store } from '@ngrx/store';
import * as fromRoot from 'reducers';
import { Pairing } from 'models/pairing.model';
import { Cluster } from 'models/cluster.model';
import { Observable } from 'rxjs/Observable';
import { getAllPairings } from 'selectors/pairing.selector';
import { ModalDialogComponent } from 'common/modal-dialog/modal-dialog.component';
import { TranslateService } from '@ngx-translate/core';
import { ClusterPairing } from 'models/cluster-pairing.model';
import { getMergedProgress } from 'selectors/progress.selector';
import { ProgressState } from 'models/progress-state.model';

const PAIRINGS_REQUEST = '[PAIRING_PAGE] PAIRINGS_REQUEST';

@Component({
  selector: 'dlm-pairings',
  templateUrl: './pairings.component.html',
  styleUrls: ['./pairings.component.scss']
})
export class PairingsComponent implements OnInit {

  @ViewChild('confirmationModal') public confirmationModel: ModalDialogComponent;
  pairings$: Observable<Pairing[]>;
  overallProgress$: Observable<ProgressState>;
  private unpairParams: Array<Object>;

  static getBeaconUrl(cluster: Cluster | ClusterPairing): string {
    let beaconUrl = '';
    if (cluster.services && cluster.services.length) {
      // todo: change servicename to BEACON_SERVER once dataplane fixes the service name
      const beaconService = cluster.services.filter(service => service.servicename === 'BEACON');
      if (beaconService.length) {
        beaconUrl = beaconService[0].fullURL;
      }
    }
    return beaconUrl;
  }

  constructor(
    private store: Store<fromRoot.State>,
    private router: Router,
    private route: ActivatedRoute,
    private translate: TranslateService
  ) {
    this.pairings$ = store.select(getAllPairings);
    this.overallProgress$ = store.select(getMergedProgress(PAIRINGS_REQUEST));
  }

  ngOnInit() {
    this.store.dispatch(loadPairings(PAIRINGS_REQUEST));
  }

  createPairingClickHandler() {
    this.router.navigate(['create'], {relativeTo: this.route});
  };

  onUnpair(pair: Pairing) {
    this.unpairParams = [{
      clusterId: pair.pair[0].id,
      beaconUrl: PairingsComponent.getBeaconUrl(pair.pair[0])
    },
    {
      clusterId: pair.pair[1].id,
      beaconUrl: PairingsComponent.getBeaconUrl(pair.pair[1])
    }];
    const params = {
      firstCluster: pair.pair[0].name,
      secondCluster: pair.pair[1].name
    };
    this.confirmationModel.body = this.translate.instant(
      'page.pairings.unpair.confirmation.body', params);
    this.confirmationModel.show();
  }

  onConfirmation() {
    this.store.dispatch(deletePairing(this.unpairParams));
  }
}
