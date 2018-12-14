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
import { ClusterPairing } from 'models/cluster-pairing.model';
import { TranslateService } from '@ngx-translate/core';
import { BytesSizePipe } from 'pipes/bytes-size.pipe';
import * as fromRoot from 'reducers';
import { Store } from '@ngrx/store';
import { Observable, Subscription } from 'rxjs';
import { Cluster } from 'models/cluster.model';
import { getClustersWithBeacon } from 'selectors/cluster.selector';
import { getDlmVersion, getStackVersion } from 'utils/pairing-util';

@Component({
  selector: 'dlm-create-pairing-card',
  templateUrl: './create-pairing-card.component.html',
  styleUrls: ['./create-pairing-card.component.scss']
})
export class CreatePairingCardComponent implements OnInit, OnDestroy {

  @Input() cluster: ClusterPairing;
  @Input() isSelected = false;
  @Input() isFrozen = false;
  clusters$: Observable<Cluster[]>;
  clusters: Cluster[];
  subscriptions: Subscription[] = [];

  get location() {
    return this.cluster.location.city + ', ' + this.cluster.location.country;
  }

  get capacityRemaining() {
    return (this.cluster && this.cluster.stats && this.cluster.stats.CapacityRemaining) ?
      this.bytesPipe.transform(this.cluster.stats.CapacityRemaining) : this.t.instant('common.na');
  }

  get isDisabled() {
    return this.cluster.disabled || this.cluster.ambariUnhealthy ||
      this.cluster.beaconUnhealthy || this.cluster.lacksPrivilege;
  }

  getStackVersion(clusterId): string {
    return getStackVersion(clusterId, this.clusters);
  }

  getDlmVersion(clusterId): string {
    const dlmVersion = getDlmVersion(clusterId, this.clusters);
    return dlmVersion ? `${this.t.instant('common.dlm')} ${dlmVersion}` : 'NA';
  }

  constructor(private t: TranslateService, private bytesPipe: BytesSizePipe, private store: Store<fromRoot.State>) { }

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
