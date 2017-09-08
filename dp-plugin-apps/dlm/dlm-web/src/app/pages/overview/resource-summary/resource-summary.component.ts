/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
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
