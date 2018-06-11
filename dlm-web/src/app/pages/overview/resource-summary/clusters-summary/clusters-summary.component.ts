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
import { ClustersStatus } from 'models/aggregations.model';
import { CLUSTERS_HEALTH_STATE } from '../resource-summary.type';

@Component({
  selector: 'dlm-clusters-summary',
  template: `
    <dlm-summary-panel
      [title]="'common.clusters'"
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
