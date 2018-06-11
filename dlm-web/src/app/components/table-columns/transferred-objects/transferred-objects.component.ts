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

import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import {UNIT_EVENTS, UNIT_LABELS, UNIT_TABLES} from 'constants/job.constant';
import {POLICY_EXECUTION_TYPES} from 'constants/policy.constant';
import { number } from 'utils/number-utils';
import { JOB_STATUS } from 'constants/status.constant';

@Component({
  selector: 'dlm-transferred-objects',
  template: `
    <span *ngIf="!isEmptyData; else noDataTpl">
      {{amount}} {{formattedUnits | translate}}
    </span>
    <ng-template #noDataTpl>
      <i class="fa fa-minus"></i>
    </ng-template>
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TransferredObjectsComponent {
  @Input() executionType: string;
  @Input() completed: number;
  @Input() filesCopied: number;
  @Input() units: string;
  @Input() total: number;
  @Input() status: string;

  get formattedUnits(): string {
    return UNIT_LABELS[this.units] || ' ';
  }

  get amount(): number {
    if (this.executionType === POLICY_EXECUTION_TYPES.HIVE) {
      return this.status === JOB_STATUS.SUCCESS ? Math.max(number(this.completed), number(this.total)) : number(this.completed);
    }
    return number(this.filesCopied);
  }


  get isEmptyData(): boolean {
    return this.amount === null;
  }
}
