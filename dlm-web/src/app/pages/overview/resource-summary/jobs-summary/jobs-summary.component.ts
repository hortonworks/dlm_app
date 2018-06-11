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

import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { JobsStatus } from 'models/aggregations.model';
import { JOBS_HEALTH_STATE } from '../resource-summary.type';

@Component({
  selector: 'dlm-jobs-summary',
  template: `
    <dlm-summary-panel
      [title]="'page.overview.summary_panels.title.jobs'"
      [total]="data.total">
      <div class="row">
        <dlm-summary-panel-cell
          class="col-xs-4"
          iconClass="fa fa-circle-o text-info"
          qe-attr="show-jobs-in-progress"
          (cellClick)="selectPanelCell.emit(healthStates.IN_PROGRESS)"
          [actionable]="data.inProgress > 0"
          [label]="'page.overview.summary_panels.status.in_progress' | translate"
          [value]="data.inProgress">
        </dlm-summary-panel-cell>
        <dlm-summary-panel-cell
          class="col-xs-4"
          iconClass="fa fa-circle text-danger"
          qe-attr="show-failed-jobs"
          (cellClick)="selectPanelCell.emit(healthStates.LAST_FAILED)"
          [actionable]="data.lastFailed > 0"
          [label]="'page.overview.summary_panels.status.failed_last' | translate"
          [hint]="'page.overview.summary_panels.hint.jobs.failed_last'"
          [value]="data.lastFailed">
        </dlm-summary-panel-cell>
        <dlm-summary-panel-cell
          class="col-xs-4"
          iconClass="fa fa-circle text-danger"
          qe-attr="show-last-10-failed-jobs"
          (cellClick)="selectPanelCell.emit(healthStates.LAST_10_FAILED)"
          [actionable]="data.last10Failed > 0"
          [label]="'page.overview.summary_panels.status.failed_last_10' | translate"
          [hint]="'page.overview.summary_panels.hint.jobs.failed_last_ten'"
          [value]="data.last10Failed">
        </dlm-summary-panel-cell>
      </div>
    </dlm-summary-panel>
  `,
  styleUrls: ['./jobs-summary.component.scss']
})
export class JobsSummaryComponent implements OnInit {
  healthStates = JOBS_HEALTH_STATE;

  @Input() data: JobsStatus;
  @Output() selectPanelCell = new EventEmitter<string>();

  constructor() { }

  ngOnInit() {
  }

}
