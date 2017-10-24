/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
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

@Component({
  selector: 'dp-jobs-table',
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
  @Input() loadingJobs;
  @Input() policy: Policy;
  @Input() selectionType = 'any';
  @Input() sorts = [];
  @Input() page = 0;
  @Input() visibleActionMap = {};
  @Input() footerOptions: TableFooterOptions;

  @Output() onSort = new EventEmitter<any>();
  @Output() onPageChange = new EventEmitter<any>();
  @Output() onSelectAction = new EventEmitter<any>();
  @Output() abortJobAction = new EventEmitter<any>();
  @Output() rerunJobAction = new EventEmitter<any>();

  rowActions = <ActionItemType[]>[
    {label: 'Abort', name: 'ABORT', enabledFor: JOB_STATUS.RUNNING, qeAttr: 'abort-job'},
    {label: 'Re-run', name: 'RERUN', disableFn: this.isRerunDisabled.bind(this), qeAttr: 'rerun-job'},
    {label: 'View Log', name: 'LOG', qeAttr: 'job-log'}
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

  handleActionOpenChange(event: {rowId: string, isOpen: boolean}) {
    const { rowId, isOpen } = event;
    if (rowId) {
      this.visibleActionMap[rowId] = isOpen;
      this.onSelectAction.emit({[rowId]: isOpen});
    }
  }

  shouldShowAction(rowId) {
    return rowId in this.visibleActionMap && this.visibleActionMap[rowId];
  }

  handleOnSort(sorts) {
    this.onSort.emit(sorts);
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
