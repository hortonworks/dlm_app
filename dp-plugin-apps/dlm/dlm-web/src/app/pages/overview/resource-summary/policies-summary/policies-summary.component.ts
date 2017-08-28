/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { PoliciesStatus } from 'models/aggregations.model';
import { POLICIES_HEALTH_STATE } from '../resource-summary.type';

@Component({
  selector: 'dlm-policies-summary',
  template: `
    <dlm-summary-panel
      [title]="'page.overview.summary_panels.title.policies'"
      [total]="data.total">
      <div class="row">
        <dlm-summary-panel-cell
          class="col-md-4"
          iconClass="fa fa-play-circle text-success"
          [label]="'page.overview.summary_panels.status.active' | translate"
          [value]="data.active">
        </dlm-summary-panel-cell>
        <dlm-summary-panel-cell
          class="col-md-4"
          iconClass="fa fa-times-circle"
          [label]="'page.overview.summary_panels.status.suspended' | translate"
          [value]="data.suspended">
        </dlm-summary-panel-cell>
        <dlm-summary-panel-cell
          class="col-md-4"
          iconClass="fa fa-exclamation-triangle text-danger"
          qe-attr="show-unhealthy-policies"
          (cellClick)="selectPanelCell.emit(healthStates.UNHEALTHY)"
          [actionable]="data.unhealthy > 0"
          [label]="'page.overview.summary_panels.status.unhealthy' | translate"
          [hint]="'page.overview.summary_panels.hint.policies.unhealthy'"
          [value]="data.unhealthy">
        </dlm-summary-panel-cell>
      </div>
    </dlm-summary-panel>
  `,
  styleUrls: ['./policies-summary.component.scss']
})
export class PoliciesSummaryComponent implements OnInit {
  healthStates = POLICIES_HEALTH_STATE;

  @Input() data: PoliciesStatus;
  @Output() selectPanelCell = new EventEmitter<string>();

  constructor() { }

  ngOnInit() {
  }

}
