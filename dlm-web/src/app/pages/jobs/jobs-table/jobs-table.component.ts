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

import { Component, OnInit, Input, Output, ViewChild, TemplateRef, EventEmitter } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Job } from 'models/job.model';
import { ActionItemType } from 'components';
import { TableComponent } from 'common/table/table.component';
import { Policy } from 'models/policy.model';
import { Store } from '@ngrx/store';
import * as fromRoot from 'reducers/';
import { JOB_STATUS, POLICY_STATUS } from 'constants/status.constant';
import { LogService } from 'services/log.service';
import { EntityType } from 'constants/log.constant';
import { contains } from 'utils/array-util';
import { transferredBytesComparator } from 'utils/table-util';
import { TableFooterOptions } from 'common/table/table-footer/table-footer.type';
import { TableFilterItem } from 'common/table/table-filter/table-filter-item.type';

@Component({
  selector: 'dlm-jobs-table',
  templateUrl: './jobs-table.component.html',
  styleUrls: ['./jobs-table.component.scss']
})
export class JobsTableComponent implements OnInit {
  JOB_STATUS = JOB_STATUS;
  columns: any[];

  @ViewChild('statusCellTemplate') statusCellTemplate: TemplateRef<any>;
  @ViewChild('statusVerbTemplate') statusVerbTemplate: TemplateRef<any>;
  @ViewChild('iconCellTemplate') iconCellTemplate: TemplateRef<any>;
  @ViewChild('agoTemplate') agoTemplate: TemplateRef<any>;
  @ViewChild('runTimeTemplate') runTimeTemplate: TemplateRef<any>;
  @ViewChild('transferredTemplate') transferredTemplate: TemplateRef<any>;
  @ViewChild('transferredFormattedTemplate') transferredFormattedTemplate: TemplateRef<any>;
  @ViewChild('transferredObjectsTemplate') transferredObjectsTemplate: TemplateRef<any>;
  @ViewChild('serviceTemplate') serviceTemplate: TemplateRef<any>;
  @ViewChild('actionsCell') actionsCellRef: TemplateRef<any>;
  @ViewChild('jobsTable') jobsTable: TableComponent;

  @Input() jobs: Job[];
  @Input() jobsOverallCount: number;
  @Input() jobsOffset: number;
  @Input() jobsInput = '';
  @Input() loadingJobs;
  @Input() policy: Policy;
  @Input() selectionType = 'any';
  @Input() sorts = [];
  @Input() page = 0;
  @Input() filters = [];
  @Input() footerOptions: TableFooterOptions;

  @Output() onSort = new EventEmitter<any>();
  @Output() onFilter = new EventEmitter<any>();
  @Output() onInput = new EventEmitter<any>();
  @Output() onPageChange = new EventEmitter<any>();
  @Output() onSelectAction = new EventEmitter<any>();
  @Output() abortJobAction = new EventEmitter<any>();
  @Output() rerunJobAction = new EventEmitter<any>();

  rowActions = <ActionItemType[]>[
    {
      label: 'Abort',
      name: 'ABORT',
      disableFn(job) {
        return job.status !== JOB_STATUS.RUNNING;
      },
      qeAttr: 'abort-job'
    },
    {label: 'Re-run', name: 'RERUN', disableFn: this.isRerunDisabled.bind(this), qeAttr: 'rerun-job'},
    {label: 'View Log', name: 'LOG', qeAttr: 'job-log'}
  ];

  filterBy: TableFilterItem[] = [
    {multiple: false, propertyName: 'status', values: Object.keys(JOB_STATUS).map(k => JOB_STATUS[k])}
  ];

  constructor(protected store: Store<fromRoot.State>,
              protected logService: LogService,
              protected t: TranslateService) { }

  protected cannotRerun(policy, lastJob) {
    return !lastJob || policy.status === POLICY_STATUS.SUSPENDED || contains([JOB_STATUS.SUCCESS, JOB_STATUS.RUNNING], lastJob.status);
  }

  protected translateColumn(columnName: string): string {
    return this.t.instant(`page.policies.jobs_table.column.${columnName}`);
  }

  selectCheck = () => false;

  ngOnInit() {
    this.columns = [
      {cellTemplate: this.statusCellTemplate, maxWidth: 25, minWidth: 25},
      {
        cellTemplate: this.statusVerbTemplate,
        prop: 'status',
        cellClass: 'text-cell',
        headerClass: 'text-header',
        name: this.translateColumn('status')
      },
      {
        prop: 'startTime',
        cellTemplate: this.agoTemplate,
        name: this.translateColumn('startTime'),
        cellClass: 'date-cell',
        headerClass: 'date-header'
      },
      {
        prop: 'endTime',
        cellTemplate: this.agoTemplate,
        name: this.translateColumn('endTime'),
        cellClass: 'date-cell',
        headerClass: 'date-header'
      },
      {
        prop: 'duration',
        cellTemplate: this.runTimeTemplate,
        name: this.translateColumn('duration'),
        cellClass: 'date-cell',
        headerClass: 'date-header',
        sortable: false
      },
      {
        prop: 'trackingInfo',
        cellTemplate: this.transferredFormattedTemplate,
        name: this.translateColumn('transferredBytes'),
        cellClass: 'date-cell',
        headerClass: 'date-header',
        comparator: transferredBytesComparator.bind(this),
        sortable: false
      },
      {
        prop: 'trackingInfo',
        name: this.translateColumn('transferredFiles'),
        cellTemplate: this.transferredObjectsTemplate,
        cellClass: 'date-cell',
        headerClass: 'date-header',
        sortable: false
      },
      {
        name: this.translateColumn('actions'),
        cellTemplate: this.actionsCellRef,
        sortable: false
      }
    ];
  }

  handleSelectedAction({row, action}) {
    switch (action.name) {
      case 'LOG':
        return this.logService.showLog(EntityType.policyinstance, row.id, row.endTime);
      case 'ABORT':
        return row.status === JOB_STATUS.RUNNING && this.abortJobAction.emit(row);
      case 'RERUN':
        return this.rerunJobAction.emit(row);
    }
  }

  isRunning(job: Job) {
    return job && !job.isCompleted;
  }

  handleOnSort(sorts) {
    this.onSort.emit(sorts);
  }

  handleOnFilter(filters) {
    this.onFilter.emit(filters);
  }

  handleOnInput(filter) {
    this.onInput.emit(filter);
  }

  handlePageChange(page) {
    this.onPageChange.emit(page);
  }

  isRerunDisabled(job, _): boolean {
    const lastJob = this.policy.lastJobResource;
    return !lastJob || lastJob.id !== job.id || this.cannotRerun(this.policy, lastJob);
  }

  isJobRuntimeGreater(job) {
    if (job.status === JOB_STATUS.SUCCESS || job.status === JOB_STATUS.WARNINGS) {
      const jobRuntime = Number(job.duration);
      const policyFrequency = Number(this.policy.frequency);
      // job duration is in milliseconds while policy frequency is in seconds
      return jobRuntime > 0 && policyFrequency > 0 && jobRuntime > (policyFrequency * 1000);
    }
    return false;
  }
}
