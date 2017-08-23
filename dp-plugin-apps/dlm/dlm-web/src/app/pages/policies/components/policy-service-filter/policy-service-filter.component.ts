/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

import { Component, EventEmitter, Output, ChangeDetectionStrategy, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';
import { POLICY_TYPES, POLICY_TYPES_LABELS } from 'constants/policy.constant';

@Component({
  selector: 'policy-service-filter',
  templateUrl: './policy-service-filter.component.html',
  styleUrls: ['./policy-service-filter.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PolicyServiceFilterComponent {

  activeService: string;

  POLICY_TYPES = POLICY_TYPES;
  POLICY_TYPES_LABELS = POLICY_TYPES_LABELS;

  @Output() onFilter: EventEmitter<any> = new EventEmitter();

  constructor (private cdRef: ChangeDetectorRef) {}

  filterPoliciesByService(service) {
    // Toggle the filters if one of the filters is already selected
    if (service === this.activeService) {
      this.activeService = null;
    } else {
      this.activeService = service;
    }
    this.cdRef.detectChanges();
    const filterValue = this.activeService ? this.activeService : '';
    this.onFilter.emit(filterValue);
  }
}
