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

import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {ReactiveFormsModule, FormsModule} from '@angular/forms';
import {configureComponentTest} from 'testing/configure';
import {CommonComponentsModule} from 'components/common-components.module';
import {TabsModule, TooltipModule} from 'ngx-bootstrap';
import {RouterTestingModule} from '@angular/router/testing';
import {CreatePolicyStepsModule} from '../create-policy-steps/create-policy-steps.module';
import {HortonStyleModule} from 'common/horton-style.module';
import {WizardContentComponent} from '../wizard-content/wizard-content.component';
import {CreatePolicyWizardComponent} from './create-policy-wizard.component';
import {PolicyService} from 'services/policy.service';
import {NavbarService} from 'services/navbar.service';
import {JobService} from 'services/job.service';
import {WizardSummaryComponent} from '../create-policy-wizard-summary/create-policy-wizard-summary.component';
import {SummaryTreeComponent} from '../summary-tree/summary-tree.component';
import {FrequencyPipe} from 'pipes/frequency.pipe';
import { TranslateService } from '@ngx-translate/core';
import { AsyncActionsService } from 'services/async-actions.service';
import { HdfsService } from 'services/hdfs.service';
import { HiveService } from 'services/hive.service';
import { BeaconService } from 'services/beacon.service';
import { ClusterService } from 'services/cluster.service';

describe('CreatePolicyWizardComponent', () => {
  let component: CreatePolicyWizardComponent;
  let fixture: ComponentFixture<CreatePolicyWizardComponent>;

  beforeEach(async(() => {
    configureComponentTest({
      imports: [
        TooltipModule.forRoot(),
        CommonComponentsModule,
        ReactiveFormsModule,
        FormsModule,
        TabsModule.forRoot(),
        CreatePolicyStepsModule,
        RouterTestingModule,
        HortonStyleModule
      ],
      declarations: [
        CreatePolicyWizardComponent,
        WizardContentComponent,
        WizardSummaryComponent,
        SummaryTreeComponent
      ],
      providers: [
        TranslateService,
        NavbarService,
        PolicyService,
        JobService,
        FrequencyPipe,
        AsyncActionsService,
        HdfsService,
        HiveService,
        BeaconService,
        ClusterService
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreatePolicyWizardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
