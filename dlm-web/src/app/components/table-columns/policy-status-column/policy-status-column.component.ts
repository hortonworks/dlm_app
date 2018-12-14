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

import { Component, ViewChild, TemplateRef, Input, ChangeDetectionStrategy } from '@angular/core';
import { POLICY_UI_STATUS, POLICY_STATUS } from 'constants/status.constant';

import { TableColumn } from 'common/table/table-column.type';
import { Policy } from 'models/policy.model';

export const COLUMN_WIDTH = 100;

@Component({
  selector: 'dlm-policy-status-column',
  template: `
    <div>
      <span *ngIf="showText">{{status}}</span>
      <div *ngIf="showInterventionWarning()" class="doc-link">
        <a [href]="'docs.policy_intervention.link' | translate" target="_blank" qe-attr="intervention-doc">
          {{'docs.policy_intervention.text' | translate}}
        </a>
      </div>
    </div>
  `,
  styleUrls: ['./policy-status-column.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class StatusColumnComponent implements TableColumn {
  @Input()
  showText = true;
  @Input() policy: Policy;
  @Input() status: string;
  @ViewChild('statusCell') cellRef: TemplateRef<any>;
  cellSettings = {
    maxWidth: COLUMN_WIDTH,
    width: COLUMN_WIDTH,
    minWidth: COLUMN_WIDTH
  };
  // todo: move statuses to constant enum? when all possible values will be known
  statusClassMap = {
    [POLICY_UI_STATUS.ACTIVE]: 'status status-running fa fa-play-circle-o',
    [POLICY_UI_STATUS.SUSPENDED]: 'status status-suspended fa fa-pause-circle-o',
    [POLICY_UI_STATUS.ENDED]: 'status status-ended fa fa-stop-circle'
  };

  getStatusClassNames(status: string) {
    return this.statusClassMap[status] || '';
  }

  showInterventionWarning() {
    return this.policy && this.policy.status === POLICY_STATUS.SUSPENDEDFORINTERVENTION;
  }
}
