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


import {map} from 'rxjs/operators';
import { Component, OnInit, ViewChild } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { Cluster } from 'models/cluster.model';
import * as fromRoot from 'reducers/index';
import { TranslateService } from '@ngx-translate/core';
import { getClusterWithUnreachableBeacon, getUnreachableClusters } from 'selectors/unreachable-beacon.selector';
import { uniqBy } from 'utils/array-util';
import { ClusterWithBeacon } from 'models/cluster.model';
import { ModalSize, ModalDialogComponent } from 'common/modal-dialog';
import { getError } from 'utils/http-util';

interface ClusterTranslate {
  [clusters: string]: string;
}

interface UnreachableBeaconError {
  clusterName: string;
  errorMessage: string;
}

@Component({
  selector: 'dlm-beacon-validity',
  templateUrl: './beacon-validity.component.html',
  styleUrls: ['./beacon-validity.component.scss']
})
export class BeaconValidityComponent implements OnInit {
  @ViewChild('beaconValidityModal') beaconValidityModal: ModalDialogComponent;
  MODAL_SIZES = ModalSize;
  unreachableBeaconErrors$: Observable<UnreachableBeaconError[]>;
  unreachableClusters$: Observable<ClusterTranslate>;

  private formatClustersMessage = (clusters: Cluster[]): ClusterTranslate => {
    if (clusters.length) {
      let clusterNames = uniqBy(clusters, 'idByDatacenter')
        .map(cluster => `<strong>${cluster.name} (${cluster.dataCenter})</strong>`);
      if (clusterNames.length > 1) {
        clusterNames = [clusterNames.slice(0, clusterNames.length - 1).join(', ')].concat(clusterNames[clusterNames.length - 1]);
      }
      return { clusters: clusterNames.join(` ${this.t.instant('common.and').toLowerCase()} `) };
    }
    return { clusters: null };
  }

  private mapUnreachableBeaconErrors (clustersWithBeacons: ClusterWithBeacon[]): UnreachableBeaconError[] {
    return clustersWithBeacons.map(clusterWithBeacon => {
      return {
        clusterName: `${clusterWithBeacon.cluster.name} (${clusterWithBeacon.cluster.dataCenter})`,
        errorMessage: getError(clusterWithBeacon.unreachableBeacon as any).message
      };
    });
  }

  constructor(private store: Store<fromRoot.State>, private t: TranslateService) {
    this.unreachableClusters$ = this.store.select(getUnreachableClusters).pipe(map(this.formatClustersMessage));
    this.unreachableBeaconErrors$ = this.store.select(getClusterWithUnreachableBeacon).pipe(
      map(this.mapUnreachableBeaconErrors)
    );
  }

  ngOnInit() {
  }

  showBeaconValidityErrors() {
    this.beaconValidityModal.show();
  }

  trackByClusterName(index, error: UnreachableBeaconError) {
    return error.clusterName;
  }
}
