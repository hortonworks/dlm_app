/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ClustersStatus } from 'models/aggregations.model';
import { CLUSTERS_HEALTH_STATE } from '../resource-summary.type';

@Component({
  selector: 'dlm-clusters-summary',
  template: `
    <dlm-summary-panel
      [title]="'page.overview.summary_panels.title.clusters'"
      [total]="data.total">
      <div class="row">
        <dlm-summary-panel-cell
          class="col-xs-4"
          iconClass="fa fa-star text-success"
          [label]="'page.overview.summary_panels.status.healthy' | translate"
          [hint]="'page.overview.summary_panels.hint.clusters.healthy'"
          [value]="data.healthy">
        </dlm-summary-panel-cell>
        <dlm-summary-panel-cell
          class="col-xs-4"
          iconClass="fa fa-circle text-warning"
          qe-attr="show-clusters-warnings"
          (cellClick)="selectPanelCell.emit(healthStates.WARNING)"
          [actionable]="data.warning > 0"
          [label]="'page.overview.summary_panels.status.warning' | translate"
          [hint]="'page.overview.summary_panels.hint.clusters.warning'"
          [value]="data.warning">
        </dlm-summary-panel-cell>
        <dlm-summary-panel-cell
          class="col-xs-4"
          iconClass="fa fa-exclamation-triangle text-danger"
          qe-attr="show-unhealthy-clusters"
          (cellClick)="selectPanelCell.emit(healthStates.UNHEALTHY)"
          [actionable]="data.unhealthy > 0"
          [label]="'page.overview.summary_panels.status.unhealthy' | translate"
          [hint]="'page.overview.summary_panels.hint.clusters.unhealthy'"
          [value]="data.unhealthy">
        </dlm-summary-panel-cell>
      </div>
    </dlm-summary-panel>
  `,
  styleUrls: ['./clusters-summary.component.scss']
})
export class ClustersSummaryComponent implements OnInit {
  healthStates = CLUSTERS_HEALTH_STATE;

  @Input() data: ClustersStatus;
  @Output() selectPanelCell = new EventEmitter<any>();

  constructor() { }

  ngOnInit() {
  }
}
