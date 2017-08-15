/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

import { Component, EventEmitter, Input, Output, ElementRef, HostListener } from '@angular/core';
import { ClusterAction } from 'models/cluster.model';

export const ACTION_TYPES = {
  PAIRING: 'PAIRING',
  POLICY: 'POLICY',
  AMBARI: 'AMBARI'
};

@Component({
  selector: 'dlm-cluster-actions',
  templateUrl: './cluster-actions.component.html',
  styleUrls: ['./cluster-actions.component.scss']
})
export class ClusterActionsComponent {
  @Input() rowId;
  @Input() clusterActions: ClusterAction[];
  @Input() cluster;
  @Input() clustersLength = 0;
  @Input() isOpen = false;
  @Output() handler: EventEmitter<any> = new EventEmitter();
  @Output() openChange: EventEmitter<any> = new EventEmitter();

  @HostListener('document:click', ['$event'])
  outsideClickHandler(e) {
    if (!this.elementRef.nativeElement.contains(event.target) && this.isOpen) {
      this.isOpen = false;
      this.openChange.emit({ rowId: this.rowId, isOpen: this.isOpen});
    }
  }

  constructor(private elementRef: ElementRef) { }

  private actionDisabled(cluster, clusterAction: ClusterAction): boolean {
    switch (clusterAction.type) {
      case ACTION_TYPES.PAIRING:
        return this.clustersLength - cluster.pairsCounter - 1 === 0;
      case ACTION_TYPES.POLICY:
        return cluster.pairsCounter === 0;
      case ACTION_TYPES.AMBARI:
        return false;
    }
  }

  handleSelectedAction(cluster, action) {
    this.toggleDropDown();
    if (!this.actionDisabled(cluster, action)) {
      this.handler.emit({cluster, action});
    }
  }

  toggleDropDown() {
    this.isOpen = !this.isOpen;
    this.openChange.emit({ rowId: this.rowId, isOpen: this.isOpen});
  }
}
