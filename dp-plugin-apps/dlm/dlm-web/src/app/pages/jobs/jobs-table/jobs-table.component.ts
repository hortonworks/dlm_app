import { Component, OnInit, Input, Output, ViewChild, TemplateRef, EventEmitter } from '@angular/core';
import { Job } from 'models/job.model';
import { ActionItemType } from 'components';
import { TableComponent } from 'common/table/table.component';
import { abortJob } from 'actions/job.action';
import { Policy } from 'models/policy.model';
import { Store } from '@ngrx/store';
import * as fromRoot from 'reducers/';
import { JOB_STATUS } from 'constants/status.constant';
import { LogService } from 'services/log.service';
import { EntityType } from 'constants/log.constant';

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
  @ViewChild('serviceTemplate') serviceTemplate: TemplateRef<any>;
  @ViewChild('actionsCell') actionsCellRef: TemplateRef<any>;
  @ViewChild('jobsTable') jobsTable: TableComponent;

  @Input() jobs: Job[];
  @Input() policy: Policy;
  @Input() showPageSizeMenu = true;
  @Input() selectionType = 'any';
  @Input() sorts = [];
  @Input() page = 0;
  @Input() visibleActionMap = {};

  @Output() onSort = new EventEmitter<any>();
  @Output() onPageChange = new EventEmitter<any>();
  @Output() onSelectAction = new EventEmitter<any>();
  @Output() abortJobAction = new EventEmitter<any>();

  rowActions = <ActionItemType[]>[
    {label: 'Abort', name: 'ABORT', enabledFor: JOB_STATUS.RUNNING},
    {label: 'View Log', name: 'LOG', }
  ];

  constructor(protected store: Store<fromRoot.State>, protected logService: LogService) {
  }

  ngOnInit() {
    this.columns = [
      {cellTemplate: this.statusCellTemplate, maxWidth: 25, minWidth: 25},
      {
        cellTemplate: this.statusVerbTemplate,
        prop: 'status',
        cellClass: 'text-cell',
        headerClass: 'text-header'
      },
      {
        prop: 'startTime',
        cellTemplate: this.agoTemplate,
        name: 'Started',
        cellClass: 'date-cell',
        headerClass: 'date-header'
      },
      {
        prop: 'endTime',
        cellTemplate: this.agoTemplate,
        name: 'Ended',
        cellClass: 'date-cell',
        headerClass: 'date-header'
      },
      {
        prop: 'trackingInfo.timeTaken',
        cellTemplate: this.runTimeTemplate,
        name: 'Runtime',
        cellClass: 'date-cell',
        headerClass: 'date-header'
      },
      {
        prop: 'trackingInfo',
        cellTemplate: this.transferredFormattedTemplate,
        name: 'Transferred Bytes',
        cellClass: 'date-cell',
        headerClass: 'date-header'
      },
      {
        prop: 'trackingInfo.filesCopied',
        name: 'Transferred Files',
        cellClass: 'date-cell',
        headerClass: 'date-header'
      },
      {name: 'Actions', cellTemplate: this.actionsCellRef, sortable: false}
    ];
  }

  handleSelectedAction({row, action}) {
    if (action.name === 'LOG') {
      this.logService.showLog(EntityType.policyinstance, row.id);
    } else if (row.status === JOB_STATUS.RUNNING) {
      this.abortJobAction.emit(row);
    }
  }

  isRunning(job: Job) {
    return job && job.duration <= 0;
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
}
