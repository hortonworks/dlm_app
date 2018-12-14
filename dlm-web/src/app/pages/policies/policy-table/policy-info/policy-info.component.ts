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

import { Component, Input, Output, ViewChild, TemplateRef, ViewEncapsulation, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { PolicyContent } from 'pages/policies/policy-details/policy-content.type';
import { TableColumn } from 'common/table/table-column.type';
import { Policy } from 'models/policy.model';
import { FEATURES } from 'models/features.model';
import { canEdit } from 'utils/policy-util';
import { UserService } from 'services/user.service';

// todo: row.startTime is actually incorrect need to get schedule interval here
@Component({
  selector: 'dlm-policy-info',
  template: `
    <ng-template #policyInfoCell let-row="row" let-expanded="expanded" let-index="rowIndex">
      <div class="policy-info">
        <p class="policy-name text-primary actionable" [attr.qe-attr]="'policy-info-' + index"
        (click)="onNameClick(row)" [tooltip]="row.name">
          {{row.name}}&nbsp;
          <span [ngClass]="{fa: true, 'fa-caret-up': isActive(expanded), 'fa-caret-down': !isActive(expanded)}">
          </span>
        </p>
        <div *ngIf="row.frequency">
          <span>{{row.frequency | frequency}}</span>
          <ng-container *ngIf="canEdit(row) && !userService.isUserReadOnly">
            <i *dlmFeature="features.policy_edit"
              class="fa fa-edit text-primary actionable"
              [attr.qe-attr]="'policy-info-edit-' + index"
              (click)="editPolicy.emit(row)"
              ></i>
          </ng-container>
        </div>
      </div>
    </ng-template>
  `,
  styleUrls: ['./policy-info.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PolicyInfoComponent implements TableColumn {
  @ViewChild('policyInfoCell') cellRef: TemplateRef<any>;
  @Output() nameClick = new EventEmitter<any>();
  @Output() editPolicy = new EventEmitter<Policy>();
  @Input() activeContent: PolicyContent;
  features = FEATURES;

  constructor(protected userService: UserService) {

  }

  canEdit(policy: Policy): boolean {
    return canEdit(policy);
  }

  onNameClick(row) {
    this.nameClick.emit(row);
  }

  isActive(expanded): boolean {
    return expanded && PolicyContent.Files === this.activeContent;
  }
}
