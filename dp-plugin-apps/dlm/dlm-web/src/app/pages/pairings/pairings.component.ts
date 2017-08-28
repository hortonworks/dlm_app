/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { loadPairings, deletePairing } from 'actions/pairing.action';
import { Store } from '@ngrx/store';
import * as fromRoot from 'reducers';
import { Pairing } from 'models/pairing.model';
import { Cluster } from 'models/cluster.model';
import { Observable } from 'rxjs/Observable';
import { getAllPairings } from 'selectors/pairing.selector';
import { TranslateService } from '@ngx-translate/core';
import { ClusterPairing } from 'models/cluster-pairing.model';
import { getMergedProgress } from 'selectors/progress.selector';
import { ProgressState } from 'models/progress-state.model';
import { confirmNextAction } from 'actions/confirmation.action';
import { ConfirmationOptions, confirmationOptionsDefaults } from 'components/confirmation-modal';
import { NOTIFICATION_TYPES } from 'constants/notification.constant';

const PAIRINGS_REQUEST = '[PAIRING_PAGE] PAIRINGS_REQUEST';

@Component({
  selector: 'dlm-pairings',
  templateUrl: './pairings.component.html',
  styleUrls: ['./pairings.component.scss']
})
export class PairingsComponent implements OnInit {
  pairings$: Observable<Pairing[]>;
  overallProgress$: Observable<ProgressState>;

  static getBeaconUrl(cluster: Cluster | ClusterPairing): string {
    return cluster.beaconUrl;
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
    const params = {
      firstCluster: pair.pair[0].name,
      secondCluster: pair.pair[1].name
    };
    const notification = {
      [NOTIFICATION_TYPES.SUCCESS]: {
        title: 'page.pairings.unpair.notification.success.title',
        body: this.translate.instant('page.pairings.unpair.notification.success.body', params)
      },
      [NOTIFICATION_TYPES.ERROR]: {
        title: 'page.pairings.unpair.error.notification.title',
      }
    };
    const nextAction = deletePairing([
      {
        clusterId: pair.pair[0].id,
        beaconUrl: PairingsComponent.getBeaconUrl(pair.pair[0])
      },
      {
        clusterId: pair.pair[1].id,
        beaconUrl: PairingsComponent.getBeaconUrl(pair.pair[1])
      }
    ], { notification });
    const confirmationOptions = <ConfirmationOptions>{
      ...confirmationOptionsDefaults,
      title: 'page.pairings.unpair.confirmation.title',
      body: this.translate.instant('page.pairings.unpair.confirmation.body', params),
      confirmBtnText: 'page.pairings.unpair.confirmation.primaryButton'
    };
    this.store.dispatch(confirmNextAction(nextAction, confirmationOptions));
  }
}
