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

import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { Cluster } from 'models/cluster.model';
import { getDlmVersion, getStackVersion } from 'utils/pairing-util';
import { Observable, Subscription } from 'rxjs';
import { Store } from '@ngrx/store';
import * as fromRoot from 'reducers';
import { getClustersWithBeacon } from 'selectors/cluster.selector';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'dlm-pairing-progress-card',
  templateUrl: './pairing-progress-card.component.html',
  styleUrls: ['./pairing-progress-card.component.scss']
})
export class PairingProgressCardComponent implements OnInit, OnDestroy {

  @Input() firstCluster: Cluster;
  @Input() secondCluster: Cluster;
  @Input() isCompleted = false;
  clusters$: Observable<Cluster[]>;
  clusters: Cluster[];
  subscriptions: Subscription[] = [];

  get locations() {
    return [
      this.firstCluster.location.city + ', ' + this.firstCluster.location.country,
      this.secondCluster.location.city + ', ' + this.secondCluster.location.country
    ];
  }

  constructor(private store: Store<fromRoot.State>, private t: TranslateService) { }

  getStackVersion(clusterId): string {
    return getStackVersion(clusterId, this.clusters);
  }

  getDlmVersion(clusterId): string {
    const dlmVersion = getDlmVersion(clusterId, this.clusters);
    return dlmVersion ? `${this.t.instant('common.dlm')} ${dlmVersion}` : 'NA';
  }

  ngOnInit() {
    this.clusters$ = this.store.select(getClustersWithBeacon);
    const clusterSubscription = this.clusters$.subscribe(clusters => this.clusters = clusters);
    this.subscriptions.push(clusterSubscription);
  }

  ngOnDestroy() {
    this.subscriptions.forEach(s => {
      if (s) {
        s.unsubscribe();
      }
    });
  }
}
