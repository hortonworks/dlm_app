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

import { Component, OnInit, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { Pairing } from 'models/pairing.model';
import { getClustersWithBeacon } from 'selectors/cluster.selector';
import { Observable, Subscription } from 'rxjs';
import { Store } from '@ngrx/store';
import * as fromRoot from 'reducers';
import { Cluster } from 'models/cluster.model';
import { getDlmVersion, getStackVersion } from 'utils/pairing-util';
import { TranslateService } from '@ngx-translate/core';
import { UserService } from 'services/user.service';

@Component({
  selector: 'dlm-pairing-card',
  templateUrl: './pairing-card.component.html',
  styleUrls: ['./pairing-card.component.scss']
})
export class PairingCardComponent implements OnInit, OnDestroy {

  @Input() pairing: Pairing;
  @Input() isSuspended = false;
  @Output() onListUnpair: EventEmitter<Pairing> = new EventEmitter<Pairing>();
  clusters$: Observable<Cluster[]>;
  clusters: Cluster[];
  subscriptions: Subscription[] = [];

  get locations() {
    return [
      this.pairing.cluster1.location.city + ', ' + this.pairing.cluster1.location.country,
      this.pairing.cluster2.location.city + ', ' + this.pairing.cluster2.location.country
    ];
  }

  getStackVersion(clusterId): string {
    return getStackVersion(clusterId, this.clusters);
  }

  getDlmVersion(clusterId): string {
    const dlmVersion = getDlmVersion(clusterId, this.clusters);
    return dlmVersion ? `${this.t.instant('common.dlm')} ${dlmVersion}` : 'NA';
  }

  constructor(
    private store: Store<fromRoot.State>,
    private t: TranslateService,
    public userService: UserService
  ) { }

  ngOnInit() {
    this.clusters$ = this.store.select(getClustersWithBeacon);
    const clusterSubscription = this.clusters$.subscribe(clusters => this.clusters = clusters);
    this.subscriptions.push(clusterSubscription);
  }

  onClickUnpair(pairing: Pairing) {
    this.onListUnpair.emit(pairing);
  }

  ngOnDestroy() {
    this.subscriptions.forEach(s => {
      if (s) {
        s.unsubscribe();
      }
    });
  }
}
