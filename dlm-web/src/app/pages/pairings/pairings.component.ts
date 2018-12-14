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

import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { loadPairings, deletePairing } from 'actions/pairing.action';
import { Store } from '@ngrx/store';
import * as fromRoot from 'reducers';
import { Pairing } from 'models/pairing.model';
import { Cluster } from 'models/cluster.model';
import { Observable } from 'rxjs';
import { getAllPairings } from 'selectors/pairing.selector';
import { TranslateService } from '@ngx-translate/core';
import { ClusterPairing } from 'models/cluster-pairing.model';
import { getMergedProgress } from 'selectors/progress.selector';
import { ProgressState } from 'models/progress-state.model';
import { confirmNextAction } from 'actions/confirmation.action';
import { ConfirmationOptions, confirmationOptionsDefaults } from 'components/confirmation-modal';
import { NOTIFICATION_TYPES } from 'constants/notification.constant';
import { PageComponent } from 'pages/page.component';
import { UserService } from 'services/user.service';

const PAIRINGS_REQUEST = '[PAIRING_PAGE] PAIRINGS_REQUEST';

@Component({
  selector: 'dlm-pairings',
  templateUrl: './pairings.component.html',
  styleUrls: ['./pairings.component.scss']
})
export class PairingsComponent extends PageComponent implements OnInit {
  pairings$: Observable<Pairing[]>;
  overallProgress$: Observable<ProgressState>;

  static getBeaconUrl(cluster: Cluster | ClusterPairing): string {
    return cluster.beaconUrl;
  }

  constructor(
    private store: Store<fromRoot.State>,
    private router: Router,
    private route: ActivatedRoute,
    private translate: TranslateService,
    public userService: UserService
  ) {
    super();
    this.pairings$ = store.select(getAllPairings);
    this.overallProgress$ = store.select(getMergedProgress(PAIRINGS_REQUEST));
  }

  ngOnInit() {
    this.store.dispatch(loadPairings(PAIRINGS_REQUEST));
  }

  createPairingClickHandler() {
    if (this.userService.isUserReadOnly) {
      return;
    }
    this.router.navigate(['create'], {relativeTo: this.route});
  }

  onUnpair(pair: Pairing) {
    const params = {
      firstCluster: pair.cluster1.name,
      secondCluster: pair.cluster2.name
    };
    const notification = {
      [NOTIFICATION_TYPES.SUCCESS]: {
        title: 'page.pairings.unpair.notification.success.title',
        body: this.translate.instant('page.pairings.unpair.notification.success.body', params)
      },
      [NOTIFICATION_TYPES.ERROR]: {
        title: 'page.pairings.unpair.notification.error.title',
      }
    };
    const nextAction = deletePairing([
      {
        clusterId: pair.cluster1.id,
        beaconUrl: PairingsComponent.getBeaconUrl(pair.cluster1)
      },
      {
        clusterId: pair.cluster2.id,
        beaconUrl: PairingsComponent.getBeaconUrl(pair.cluster2)
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
