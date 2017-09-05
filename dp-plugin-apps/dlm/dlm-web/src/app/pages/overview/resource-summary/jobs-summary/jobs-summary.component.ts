/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
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
          iconClass="fa fa-circle text-info"
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
