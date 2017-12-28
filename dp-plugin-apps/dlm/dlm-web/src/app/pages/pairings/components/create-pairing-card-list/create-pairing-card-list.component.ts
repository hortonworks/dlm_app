/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

import { Component, OnInit, OnChanges,  SimpleChange, Input, Output, forwardRef, ViewEncapsulation, EventEmitter } from '@angular/core';
import { ClusterPairing } from 'models/cluster-pairing.model';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';

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
  selectedClusterId: number;

  onChange = (_: any) => {};

  constructor() { }

  ngOnInit() { }

  ngOnChanges(changes: {[propertyName: string]: SimpleChange}) {
    if (changes['clusters']) {
      this.pairedClusters = this.clusters.filter(cluster => cluster.disabled === true);
      this.unhealthyClusters = this.clusters.filter(cluster => cluster.disabled !== true &&
      (cluster.ambariUnhealthy === true || cluster.beaconUnhealthy === true));
      this.clusters = this.clusters.filter(cluster => cluster.disabled !== true && cluster.ambariUnhealthy !== true &&
      cluster.beaconUnhealthy !== true);
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
