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

import { Component, OnInit, OnChanges,  SimpleChange, Input, Output, forwardRef, ViewEncapsulation, EventEmitter } from '@angular/core';
import { ClusterPairing } from 'models/cluster-pairing.model';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
import { User } from 'models/user.model';
import { AuthUtils } from 'utils/auth-utils';

export const CUSTOM_RADIO_BUTTON_CONTROL_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  /* tslint:disable-next-line:no-use-before-declare */
  useExisting: forwardRef(() => CreatePairingCardListComponent),
  multi: true
};

@Component({
  selector: 'dlm-create-pairing-card-list',
  templateUrl: './create-pairing-card-list.component.html',
  styleUrls: ['./create-pairing-card-list.component.scss'],
  providers: [CUSTOM_RADIO_BUTTON_CONTROL_VALUE_ACCESSOR],
  encapsulation: ViewEncapsulation.None
})
export class CreatePairingCardListComponent implements OnInit, OnChanges, ControlValueAccessor {

  @Input() clusters: ClusterPairing[];
  @Input() selectedCluster: ClusterPairing;
  @Input() isFrozen = false;
  @Output() change = new EventEmitter<ClusterPairing>();
  pairedClusters: ClusterPairing[];
  unhealthyClusters: ClusterPairing[];
  lackOfAmbariPrivilegeClusters: ClusterPairing[];
  selectedClusterId: number;
  user: User = <User>{};

  onChange = (_: any) => {};

  get userDisplayName() {
    return {username: this.user.display};
  }

  constructor() {
    this.user = AuthUtils.getUser();
  }

  ngOnInit() { }

  ngOnChanges(changes: {[propertyName: string]: SimpleChange}) {
    if (changes['clusters']) {
      this.pairedClusters = this.clusters.filter(cluster => cluster.disabled === true);
      this.unhealthyClusters = this.clusters.filter(cluster => cluster.disabled !== true &&
      (cluster.ambariUnhealthy === true || cluster.beaconUnhealthy === true));
      this.lackOfAmbariPrivilegeClusters = this.clusters.filter(cluster => cluster.lacksPrivilege);
      this.clusters = this.clusters.filter(cluster => cluster.disabled !== true && cluster.ambariUnhealthy !== true &&
      cluster.beaconUnhealthy !== true && !cluster.lacksPrivilege);
    }
    if (changes['selectedCluster']) {
      if (this.selectedCluster) {
        this.selectedClusterId = this.selectedCluster.id;
      } else {
        this.selectedClusterId = null;
      }
    }
  }

  writeValue(clusterId: number) {
    this.selectedClusterId = clusterId;
  }

  registerOnChange(onChange) {
    this.onChange = onChange;
  }

  registerOnTouched() { }

  selectCluster(cluster: ClusterPairing) {
    if (!cluster.disabled && !this.isFrozen) {
      this.selectedClusterId = cluster.id;
      this.onChange(this.selectedClusterId);
      this.change.emit(cluster);
    }
  }
}
