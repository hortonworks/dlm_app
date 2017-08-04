/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

import { Component, EventEmitter, Output } from '@angular/core';
import { POLICY_TYPES, POLICY_TYPES_LABELS } from 'constants/policy.constant';

@Component({
  selector: 'policy-service-filter',
  templateUrl: './policy-service-filter.component.html',
  styleUrls: ['./policy-service-filter.component.scss']
})
export class PolicyServiceFilterComponent {

  activeService: '';

  POLICY_TYPES = POLICY_TYPES;
  POLICY_TYPES_LABELS = POLICY_TYPES_LABELS;

  @Output() onFilter: EventEmitter<any> = new EventEmitter();

  filterPoliciesByService(service) {
    this.activeService = this.activeService === service ? '' : service;
    this.onFilter.emit(this.activeService);
  }

}
