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

import { Component, OnInit, Input, Output, ChangeDetectionStrategy, EventEmitter } from '@angular/core';
import { ResourceInfo } from './resource-summary.type';
import { ClustersStatus, PoliciesStatus, JobsStatus } from 'models/aggregations.model';
import { Cluster } from 'models/cluster.model';
import { Policy } from 'models/policy.model';
import { Job } from 'models/job.model';
import { TranslateService } from '@ngx-translate/core';
import { SUMMARY_PANELS } from './resource-summary.type';

@Component({
  selector: 'dlm-resource-summary',
  template: `
    <div class="row">
      <dlm-clusters-summary class="col-xs-4 summary-panel"
        (selectPanelCell)="handleSelectPanelCell(panels.CLUSTER, $event)"
        [data]="clusters">
      </dlm-clusters-summary>
      <dlm-policies-summary class="col-xs-4 summary-panel"
        (selectPanelCell)="handleSelectPanelCell(panels.POLICIES, $event)"
        [data]="policies">
      </dlm-policies-summary>
      <dlm-jobs-summary class="col-xs-4 summary-panel"
        (selectPanelCell)="handleSelectPanelCell(panels.JOBS, $event)"
        [data]="jobs">
      </dlm-jobs-summary>
    </div>
  `,
  styleUrls: ['./resource-summary.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ResourceSummaryComponent implements OnInit {
  panels = SUMMARY_PANELS;
  @Input() clusters: ClustersStatus;
  @Input() policies: PoliciesStatus;
  @Input() jobs: JobsStatus;
  @Output() onSelectPanelCell = new EventEmitter<any>();

  ngOnInit() {
  }

  handleSelectPanelCell(panel, cell) {
    this.onSelectPanelCell.emit({panel, cell});
  }

}
