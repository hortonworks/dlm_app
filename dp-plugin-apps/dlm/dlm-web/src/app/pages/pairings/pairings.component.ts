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

@Component({
  selector: 'dlm-pairings',
  templateUrl: './pairings.component.html',
  styleUrls: ['./pairings.component.scss']
})
export class PairingsComponent implements OnInit {

  @ViewChild('confirmationModal') public confirmationModel: ModalDialogComponent;
  pairings$: Observable<Pairing[]>;
  private pairings: Pairing[];
  private unpairParams: Array<Object>;

  constructor(
    private store: Store<fromRoot.State>,
    private router: Router,
    private route: ActivatedRoute,
    private translate: TranslateService
  ) {
    this.pairings$ = store.select(getAllPairings);
  }

  ngOnInit() {
    this.store.dispatch(loadPairings());
    this.pairings$.subscribe(pairings => this.pairings = pairings);
  }

  createPairingClickHandler() {
    this.router.navigate(['create'], {relativeTo: this.route});
  };

  onUnpair(pair: Pairing) {
    this.unpairParams = [{
      clusterId: pair.pair[0].id,
      beaconUrl: this.getBeaconUrl(pair.pair[0])
    },
    {
      clusterId: pair.pair[1].id,
      beaconUrl: this.getBeaconUrl(pair.pair[1])
    }];
    const params = {
      firstCluster: pair.pair[0].name,
      secondCluster: pair.pair[1].name
    };
    this.confirmationModel.body = this.translate.instant(
      'page.pairings.unpair.confirmation.body', params);
    this.confirmationModel.show();
  }

  getBeaconUrl(cluster: Cluster): string {
    let beaconUrl = '';
    if (cluster.services && cluster.services.length) {
      const beaconService = cluster.services.filter(service => service.servicename === 'BEACON_SERVER');
      if (beaconService.length) {
        beaconUrl = beaconService[0].fullURL;
      }
    }
    return beaconUrl;
  }

  onConfirmation() {
    this.store.dispatch(deletePairing(this.unpairParams));
  }
}
