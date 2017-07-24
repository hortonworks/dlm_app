import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { JobsStatus } from 'models/aggregations.model';
import { JOBS_HEALTH_STATE } from '../resource-summary.type';

@Component({
  selector: 'dlm-jobs-summary',
  template: `
    <dlm-summary-panel [title]="'page.overview.summary_panels.title.jobs' | translate" [total]="data.total">
      <div class="row">
        <dlm-summary-panel-cell
          class="col-md-4"
          iconClass="fa fa-circle text-info"
          (cellClick)="selectPanelCell.emit(healthStates.IN_PROGRESS)"
          [actionable]="data.inProgress > 0"
          [label]="'page.overview.summary_panels.status.in_progress' | translate"
          [value]="data.inProgress">
        </dlm-summary-panel-cell>
        <dlm-summary-panel-cell
          class="col-md-4"
          iconClass="fa fa-circle text-danger"
          (cellClick)="selectPanelCell.emit(healthStates.LAST_FAILED)"
          [actionable]="data.lastFailed > 0"
          [label]="'page.overview.summary_panels.status.failed_last' | translate"
          [value]="data.lastFailed">
        </dlm-summary-panel-cell>
        <dlm-summary-panel-cell
          class="col-md-4"
          iconClass="fa fa-circle text-danger"
          (cellClick)="selectPanelCell.emit(healthStates.LAST_10_FAILED)"
          [actionable]="data.last10Failed > 0"
          [label]="'page.overview.summary_panels.status.failed_last_10' | translate"
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
