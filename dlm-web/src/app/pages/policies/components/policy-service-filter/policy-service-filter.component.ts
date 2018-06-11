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
