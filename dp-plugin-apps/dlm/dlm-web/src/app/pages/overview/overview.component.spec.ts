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
import { JobStatusComponent } from 'pages/jobs/job-status/job-status.component';
import { JobTransferredGraphComponent } from 'pages/jobs/jobs-transferred-graph/job-transferred-graph.component';
import { TableComponent } from 'common/table/table.component';
import { CheckboxColumnComponent, ActionColumnComponent } from 'components';
import { BytesSizePipe } from 'pipes/bytes-size.pipe';
import { TableFooterComponent } from 'common/table/table-footer/table-footer.component';
import { CheckboxComponent } from 'common/checkbox/checkbox.component';
import { NavbarService } from 'services/navbar.service';
import { FmtTzPipe } from 'pipes/fmt-tz.pipe';
import { PolicyStatusFmtPipe } from 'pipes/policy-status-fmt.pipe';
import { JobsOverviewTableComponent } from './jobs-overview-table/jobs-overview-table.component';
import { ModalDialogComponent } from 'common/modal-dialog/modal-dialog.component';
import { OverviewJobsExternalFiltersService } from 'services/overview-jobs-external-filters.service';
import { Policy } from 'models/policy.model';
import { JOB_STATUS, POLICY_STATUS } from 'constants/status.constant';
import { Job } from 'models/job.model';
import { Cluster } from 'models/cluster.model';
import { PrevJobsComponent } from '../policies/components/prev-jobs/prev-jobs.component';

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
        CommonComponentsModule
      ],
      declarations: [
        OverviewComponent,
        IssuesListComponent,
        IssuesListItemComponent,
        ResourceChartsComponent,
        JobsTableComponent,
        JobStatusComponent,
        TableComponent,
        JobTransferredGraphComponent,
        BytesSizePipe,
        TableFooterComponent,
        CheckboxColumnComponent,
        ActionColumnComponent,
        CheckboxComponent,
        FmtTzPipe,
        PolicyStatusFmtPipe,
        JobsOverviewTableComponent,
        ModalDialogComponent,
        PrevJobsComponent
      ],
      providers: [
        {provide: Store, useClass: MockStore},
        {
          provide: OverviewJobsExternalFiltersService, useValue: {
          filters$: new BehaviorSubject({})
        }
        },
        NavbarService
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

});

describe('OverviewComponent UT', () => {

  let component;

  beforeEach(() => {
    component = new OverviewComponent(new MockStore(), new OverviewJobsExternalFiltersService());
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

  describe('#makeResourceData', () => {

    it('should group jobs', () => {
      const expectedResult = {
        labels: jobLabels,
        data: [1, 3, 4, 2]
      };
      expect(component.makeResourceData('jobs', jobs)).toEqual(expectedResult);
    });

    it('should group policies', () => {
      const expectedResult = {
        labels: policyLabels,
        data: [1, 2, 3]
      };
      expect(component.makeResourceData('policies', policies)).toEqual(expectedResult);
    });

  });

  describe('#mapResourceData', () => {
    it('should map resources data', () => {
      const expectedResult = {
        clusters: {
          data: [3],
          labels: clusterLabels
        },
        policies: {
          data: [1, 2, 3],
          labels: policyLabels
        },
        jobs: {
          data: [1, 3, 4, 2],
          labels: jobLabels
        }
      };
      expect(component.mapResourceData(jobs, policies, clusters)).toEqual(expectedResult);
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

  describe('#prepareChartData', () => {

    const clustersData = [
      <Cluster>{id: 1, name: 'c1'},
      <Cluster>{id: 2, name: 'c2'},
      <Cluster>{id: 3, name: 'not mapped cluster'}
    ];

    const jobsData = [
      <Job>{id: '1', name: 'p1', status: JOB_STATUS.SUCCESS},
      <Job>{id: '2', name: 'p2', status: JOB_STATUS.RUNNING},
      <Job>{id: '3', name: 'p3', status: JOB_STATUS.WARNINGS},
      <Job>{id: '4', name: 'p4', status: JOB_STATUS.FAILED},
      <Job>{id: '5', name: 'not mapped job', status: JOB_STATUS.SUCCESS}
    ];

    const policiesData = [
      <Policy>{
        name: 'p1',
        sourceCluster: 'c1',
        targetCluster: 'c2',
        lastJobResource: jobsData[0],
        status: POLICY_STATUS.RUNNING,
        jobsResource: [{}]
      },
      <Policy>{
        name: 'p2',
        sourceCluster: 'c2',
        targetCluster: 'c1',
        lastJobResource: jobsData[1],
        status: POLICY_STATUS.SUBMITTED,
        jobsResource: [{}]
      },
      <Policy>{
        name: 'p3',
        sourceCluster: 'c1',
        targetCluster: 'c2',
        lastJobResource: jobsData[2],
        status: POLICY_STATUS.SUSPENDED,
        jobsResource: [{}]
      },
      <Policy>{
        name: 'p4',
        sourceCluster: 'c2',
        targetCluster: 'c1',
        lastJobResource: jobsData[3],
        status: POLICY_STATUS.SUSPENDED,
        jobsResource: [{}]
      }
    ];

    [
      {
        m: 'jobs, policies and clusters are mapped',
        e: {
          clusters: {
            data: [2],
            labels: clusterLabels
          },
          policies: {
            data: [1, 1, 2],
            labels: policyLabels
          },
          jobs: {
            data: [1, 1, 1, 1],
            labels: jobLabels
          }
        },
        args: [jobsData, policiesData, clustersData, {}],
      }
    ].forEach(test => {
      it(test.m, () => {
        expect(component.prepareChartData(...test.args)).toEqual(test.e);
      });
    });

  });

});
