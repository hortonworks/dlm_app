/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { UNIT_LABELS } from 'constants/job.constant';

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
  @Input() amount: number;
  @Input() units: string;

  get formattedUnits(): string {
    return UNIT_LABELS[this.units] || ' ';
  }

  get isEmptyData(): boolean {
    return this.amount === null;
  }
}
