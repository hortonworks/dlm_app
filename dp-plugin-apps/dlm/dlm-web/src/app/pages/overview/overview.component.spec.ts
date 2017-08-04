/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { MomentModule } from 'angular2-moment';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { ChartsModule } from 'ng2-charts/ng2-charts';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { TooltipModule, ModalModule, ProgressbarModule } from 'ng2-bootstrap';
import { RouterTestingModule } from '@angular/router/testing';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import * as moment from 'moment';

import { CommonComponentsModule } from 'components/common-components.module';
import { MockTranslateLoader } from 'mocks/mock-translate-loader';
import { MockStore } from 'mocks/mock-store';
import { OverviewComponent } from './overview.component';
import { IssuesListComponent } from './issues-list/issues-list.component';
import { IssuesListItemComponent } from './issues-list-item/issues-list-item.component';
import { ResourceChartsComponent } from './resource-charts/';
import { JobsTableComponent } from 'pages/jobs/jobs-table/jobs-table.component';
import { JobTransferredGraphComponent } from 'pages/jobs/jobs-transferred-graph/job-transferred-graph.component';
import { TableComponent } from 'common/table/table.component';
import { CheckboxColumnComponent, ActionColumnComponent } from 'components';
import { TableFooterComponent } from 'common/table/table-footer/table-footer.component';
import { CheckboxComponent } from 'common/checkbox/checkbox.component';
import { NavbarService } from 'services/navbar.service';
import { JobsOverviewTableComponent } from './jobs-overview-table/jobs-overview-table.component';
import { ModalDialogBodyComponent } from 'common/modal-dialog/modal-dialog-body.component';
import { OverviewJobsExternalFiltersService } from 'services/overview-jobs-external-filters.service';
import { Policy } from 'models/policy.model';
import { JOB_STATUS, POLICY_STATUS } from 'constants/status.constant';
import { Job } from 'models/job.model';
import { Cluster } from 'models/cluster.model';
import { PrevJobsComponent } from '../policies/components/prev-jobs/prev-jobs.component';
import { PipesModule } from 'pipes/pipes.module';
import { LogService } from 'services/log.service';
import {MockBackend} from '@angular/http/testing';
import {BaseRequestOptions, ConnectionBackend, Http, RequestOptions} from '@angular/http';
import {HttpService} from 'services/http.service';
import { OverviewModule } from './overview.module';
import { ModalDialogComponent } from 'common/modal-dialog/modal-dialog.component';

const jobs = [
  <Job>{status: JOB_STATUS.SUCCESS},
  <Job>{status: JOB_STATUS.FAILED},
  <Job>{status: JOB_STATUS.FAILED},
  <Job>{status: JOB_STATUS.FAILED},
  <Job>{status: JOB_STATUS.FAILED},
  <Job>{status: JOB_STATUS.WARNINGS},
  <Job>{status: JOB_STATUS.WARNINGS},
  <Job>{status: JOB_STATUS.WARNINGS},
  <Job>{status: JOB_STATUS.RUNNING},
  <Job>{status: JOB_STATUS.RUNNING},
];

const policies = [
  <Policy>{status: POLICY_STATUS.RUNNING},
  <Policy>{status: POLICY_STATUS.SUSPENDED},
  <Policy>{status: POLICY_STATUS.SUSPENDED},
  <Policy>{status: POLICY_STATUS.SUSPENDED},
  <Policy>{status: POLICY_STATUS.SUBMITTED},
  <Policy>{status: POLICY_STATUS.SUBMITTED},
];

const clusters = [
  <Cluster>{},
  <Cluster>{},
  <Cluster>{}
];

const jobLabels = [JOB_STATUS.SUCCESS, JOB_STATUS.WARNINGS, JOB_STATUS.FAILED, JOB_STATUS.RUNNING];
const policyLabels = [POLICY_STATUS.RUNNING, POLICY_STATUS.SUBMITTED, POLICY_STATUS.SUSPENDED];
const clusterLabels = ['Registered'];

describe('OverviewComponent', () => {
  let component: OverviewComponent;
  let fixture: ComponentFixture<OverviewComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        ModalModule.forRoot(),
        ProgressbarModule.forRoot(),
        TooltipModule,
        TranslateModule.forRoot({
          loader: {provide: TranslateLoader, useClass: MockTranslateLoader}
        }),
        MomentModule,
        NgxDatatableModule,
        ChartsModule,
        FormsModule,
        ReactiveFormsModule,
        CommonComponentsModule,
        PipesModule,
        OverviewModule
      ],
      declarations: [
        OverviewComponent,
        IssuesListComponent,
        IssuesListItemComponent,
        ResourceChartsComponent,
        JobsTableComponent,
        TableComponent,
        JobTransferredGraphComponent,
        TableFooterComponent,
        CheckboxColumnComponent,
        ActionColumnComponent,
        CheckboxComponent,
        JobsOverviewTableComponent,
        ModalDialogComponent,
        PrevJobsComponent,
        ModalDialogBodyComponent
      ],
      providers: [
        {provide: Store, useClass: MockStore},
        {
          provide: OverviewJobsExternalFiltersService, useValue: {
          filters$: new BehaviorSubject({})
        }
        },
        {provide: ConnectionBackend, useClass: MockBackend},
        {provide: RequestOptions, useClass: BaseRequestOptions},
        {provide: Http, useClass: HttpService},
        Http,
        HttpService,
        NavbarService,
        LogService
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('#filterPolicyByJob', () => {

    [
      {
        m: 'No jobs for policy',
        policy: <Policy>{},
        filters: {timeRange: new Date().getTime()},
        e: true
      },
      {
        m: 'No timeRange filter',
        policy: <Policy>{lastJobResource: {}},
        filters: {timeRange: ''},
        e: true
      },
      {
        m: 'Job was today',
        policy: <Policy>{lastJobResource: {endTime: new Date().toISOString()}},
        filters: {timeRange: 'day'},
        e: true
      },
      {
        m: 'Job wasn\'t today',
        policy: <Policy>{lastJobResource: {endTime: moment().subtract(2, 'day').toISOString()}},
        filters: {timeRange: 'day'},
        e: false
      },
      {
        m: 'Job was on this week',
        policy: <Policy>{lastJobResource: {endTime: new Date().toISOString()}},
        filters: {timeRange: 'week'},
        e: true
      },
      {
        m: 'Job wasn\'t on last week',
        policy: <Policy>{lastJobResource: {endTime: moment().subtract(2, 'week').toISOString()}},
        filters: {timeRange: 'week'},
        e: false
      },
      {
        m: 'Job was on this month',
        policy: <Policy>{lastJobResource: {endTime: new Date().toISOString()}},
        filters: {timeRange: 'month'},
        e: true
      },
      {
        m: 'Job wasn\'t on this month',
        policy: <Policy>{lastJobResource: {endTime: moment().subtract(2, 'month').toISOString()}},
        filters: {timeRange: 'month'},
        e: false
      }
    ].forEach(test => {
      it(test.m, () => {
        expect(component.filterPolicyByJob(test.policy, test.filters)).toBe(test.e);
      });
    });

  });

  describe('#mapTableData', () => {
    [
      {
        m: 'No lastJobResource in policy',
        policy: <Policy>{},
        e: {service: ''}
      },
      {
        m: 'lastJobResource exists (execution type FS)',
        policy: <Policy>{lastJobResource: {executionType: 'FS'}},
        e: {lastJobResource: {executionType: 'FS'}, service: 'HDFS'}
      },
      {
        m: 'lastJobResource exists (execution type HIVE)',
        policy: <Policy>{lastJobResource: {executionType: 'HIVE'}},
        e: {lastJobResource: {executionType: 'HIVE'}, service: 'Hive'}
      }
    ].forEach(test => {
      it(test.m, () => {
        expect(component.mapTableData(test.policy)).toEqual(test.e);
      });
    });
  });
});
