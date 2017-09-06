/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

import { Component, Input, Output, ViewChild, TemplateRef, ViewEncapsulation, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { PolicyContent } from 'pages/policies/policy-details/policy-content.type';
import { TableColumn } from 'common/table/table-column.type';
import { Policy } from 'models/policy.model';

// todo: row.startTime is actually incorrect need to get schedule interval here
@Component({
  selector: 'dlm-policy-info',
  template: `
    <ng-template #policyInfoCell let-row="row">
      <div class="policy-info">
        <p class="policy-name text-primary actionable" qe-attr="policy-info" (click)="onNameClick(row)" [tooltip]="row.name">
          {{row.name}}&nbsp;
          <span [ngClass]="{fa: true, 'fa-caret-up': isActive(row), 'fa-caret-down': !isActive(row)}">
          </span>
        </p>
        <p *ngIf="row.frequency" [tooltip]=popTemplate>{{row.frequency | frequency}}</p>
      </div>
      <template #popTemplate>
        {{row.startTime | fmtTz:'MMM DD, Y HH:mm'}}
        <span *ngIf="row.startTime && row.endTime">-</span>
        <span *ngIf="row.endTime">{{row.endTime | fmtTz:'MMM DD, Y HH:mm'}}</span>
      </template>
    </ng-template>
  `,
  styleUrls: ['./policy-info.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PolicyInfoComponent implements TableColumn {
  @ViewChild('policyInfoCell') cellRef: TemplateRef<any>;
  @Output() nameClick = new EventEmitter<any>();
  @Input() expandedRows: any = {};
  @Input() activeContent: PolicyContent;

  onNameClick(row) {
    this.nameClick.emit(row);
  }

  isActive(policy): boolean {
    return this.expandedRows[policy.id] && PolicyContent.Files === this.activeContent;
  }
}
