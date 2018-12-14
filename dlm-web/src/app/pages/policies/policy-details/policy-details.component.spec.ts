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
import { PolicyDetailsComponent } from './policy-details.component';
import { FrequencyPipe } from 'pipes/frequency.pipe';
import { DirectivesModule } from 'directives/directives.module';
import { FeatureService } from 'services/feature.service';
import { TranslateTestingModule } from 'testing/translate-testing.module';
import { TimeZoneService } from 'services/time-zone.service';
import { timeZoneStub, featureStub, userServiceStub } from 'testing/mock-services';
import { MockComponent } from 'testing/mock-component';
import { UserService } from 'services/user.service';

describe('PolicyDetailsComponent', () => {
  let component: PolicyDetailsComponent;
  let fixture: ComponentFixture<PolicyDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        TranslateTestingModule,
        DirectivesModule
      ],
      declarations: [
        PolicyDetailsComponent,
        MockComponent({selector: 'dlm-summary-tree', inputs: ['items', 'header']}),
        MockComponent({selector: 'dlm-jobs-table', inputs: ['sorts', 'filters', 'page', 'footerOptions', 'jobs',
        'jobsOffset', 'jobsInput', 'jobsOverallCount', 'policy', 'loadingJobs']}),
        MockComponent({selector: 'dlm-hdfs-browser', inputs: ['rootPath', 'cluster', 'page', 'restrictAboveRootPath']}),
        MockComponent({selector: 'dlm-progress-container', inputs: ['progressState']}),
        MockComponent({selector: 'dlm-hive-browser', inputs: ['tablesLoadingMap', 'databases', 'searchPattern', ]}),
        MockComponent({selector: 'dlm-inline-edit', inputs: ['showWidget', 'value', 'type', 'options', 'qeAttr']})
      ],
      providers: [
        { provide: TimeZoneService, useValue: timeZoneStub },
        { provide: FeatureService, useValue: featureStub },
        { provide: UserService, useValue: userServiceStub },
        FrequencyPipe,
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PolicyDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
