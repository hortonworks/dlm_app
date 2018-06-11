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

import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { MomentModule } from 'angular2-moment';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TypeaheadModule, TooltipModule, ModalModule, ProgressbarModule } from 'ngx-bootstrap';
import { RouterTestingModule } from '@angular/router/testing';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import * as moment from 'moment';

import { CommonComponentsModule } from 'components/common-components.module';
import { OverviewComponent } from './overview.component';
import { IssuesListComponent } from './issues-list/issues-list.component';
import { IssuesListItemComponent } from './issues-list-item/issues-list-item.component';
import { JobsTableComponent } from 'pages/jobs/jobs-table/jobs-table.component';
import { TableComponent } from 'common/table/table.component';
import { CheckboxColumnComponent, ActionColumnComponent } from 'components';
import { TableFooterComponent } from 'common/table/table-footer/table-footer.component';
import { CheckboxComponent } from 'common/checkbox/checkbox.component';
import { NavbarService } from 'services/navbar.service';
import { JobsOverviewTableComponent } from './jobs-overview-table/jobs-overview-table.component';
import { EventMessageComponent } from 'common/notifications/event-message/event-message.component';
import { OverviewJobsExternalFiltersService } from 'services/overview-jobs-external-filters.service';
import { Policy } from 'models/policy.model';
import { JOB_STATUS, POLICY_STATUS } from 'constants/status.constant';
import { Job } from 'models/job.model';
import { Cluster } from 'models/cluster.model';
import { PrevJobsComponent } from '../policies/components/prev-jobs/prev-jobs.component';
import { PipesModule } from 'pipes/pipes.module';
import { LogService } from 'services/log.service';
import { OverviewModule } from './overview.module';
import { HortonStyleModule } from 'common/horton-style.module';
import { NotificationService } from 'services/notification.service';
import { TableFilterComponent } from 'common/table/table-filter/table-filter.component';
import { configureComponentTest } from 'testing/configure';
import { AsyncActionsService } from 'services/async-actions.service';

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
    configureComponentTest({
      imports: [
        RouterTestingModule,
        ModalModule.forRoot(),
        ProgressbarModule.forRoot(),
        TypeaheadModule.forRoot(),
        TooltipModule,
        MomentModule,
        NgxDatatableModule,
        FormsModule,
        ReactiveFormsModule,
        CommonComponentsModule,
        PipesModule,
        OverviewModule,
        HortonStyleModule
      ],
      declarations: [
        OverviewComponent,
        IssuesListComponent,
        IssuesListItemComponent,
        JobsTableComponent,
        JobsOverviewTableComponent,
        PrevJobsComponent,
        EventMessageComponent
      ],
      providers: [
        {
          provide: OverviewJobsExternalFiltersService, useValue: {
            filters$: new BehaviorSubject({})
          }
        },
        {
          provide: NotificationService,
          useValue: jasmine.createSpyObj('notificationService', ['create'])
        },
        LogService,
        AsyncActionsService
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
        policy: <Policy>{lastJobResource: {type: 'FS'}},
        e: {lastJobResource: {type: 'FS'}, service: 'HDFS'}
      },
      {
        m: 'lastJobResource exists (execution type HIVE)',
        policy: <Policy>{lastJobResource: {type: 'HIVE'}},
        e: {lastJobResource: {type: 'HIVE'}, service: 'Hive'}
      }
    ].forEach(test => {
      it(test.m, () => {
        interface MapTableResult extends Policy {
          service: string;
        }
        expect(component.mapTableData(test.policy)).toEqual(test.e as MapTableResult);
      });
    });
  });
});
