/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

import { Component, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';
import { Cluster } from 'models/cluster.model';
import * as fromRoot from 'reducers/index';
import { TranslateService } from '@ngx-translate/core';
import { getUnreachableClusters } from 'selectors/unreachable-beacon.selector';

interface ClusterTranslate {
  [clusters: string]: string;
}

@Component({
  selector: 'dlm-beacon-validity',
  templateUrl: './beacon-validity.component.html',
  styleUrls: ['./beacon-validity.component.scss']
})
export class BeaconValidityComponent implements OnInit {
  unreachableClusters$: Observable<ClusterTranslate>;

  private formatClustersMessage = (clusters: Cluster[]): ClusterTranslate => {
    if (clusters.length) {
      let clusterNames = clusters.map(cluster => `<strong>${cluster.name} (${cluster.dataCenter})</strong>`);
      if (clusterNames.length > 1) {
        clusterNames = [clusterNames.slice(0, clusterNames.length - 1).join(', ')].concat(clusterNames[clusterNames.length - 1]);
      }
      return { clusters: clusterNames.join(` ${this.t.instant('common.and').toLowerCase()} `) };
    }
    return { clusters: null };
  }

  constructor(private store: Store<fromRoot.State>, private t: TranslateService) {
    this.unreachableClusters$ = store.select(getUnreachableClusters).map(this.formatClustersMessage);
  }

  ngOnInit() {
  }
}
