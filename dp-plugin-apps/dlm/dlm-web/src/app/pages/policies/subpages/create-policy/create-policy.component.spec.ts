/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {ReactiveFormsModule, FormsModule} from '@angular/forms';
import { TabsModule} from 'ngx-bootstrap';

import {CommonComponentsModule} from 'components/common-components.module';
import {CreatePolicyModalComponent} from '../../components/create-policy-modal/create-policy-modal.component';
import {CreatePolicyWizardComponent} from '../../components/create-policy-wizard/create-policy-wizard.component';
import {CreatePolicyComponent} from './create-policy.component';
import {WizardContentComponent} from '../../components/wizard-content/wizard-content.component';
import {CreatePolicyStepsModule} from '../../components/create-policy-steps/create-policy-steps.module';
import {NavbarService} from 'services/navbar.service';
import { RouterTestingModule } from '@angular/router/testing';
import {TooltipModule} from 'ngx-bootstrap';
import {configureComponentTest} from 'testing/configure';
import {HortonStyleModule} from 'common/horton-style.module';
import {PolicyService} from 'services/policy.service';
import {JobService} from 'services/job.service';
import {WizardSummaryComponent} from 'pages/policies/components/create-policy-wizard-summary/create-policy-wizard-summary.component';
import {SummaryTreeComponent} from 'pages/policies/components/summary-tree/summary-tree.component';
import {FrequencyPipe} from 'pipes/frequency.pipe';
import { AsyncActionsService } from 'services/async-actions.service';
import { HdfsService } from 'services/hdfs.service';
import { HiveService } from 'services/hive.service';

describe('CreatePolicyComponent', () => {
  let component: CreatePolicyComponent;
  let fixture: ComponentFixture<CreatePolicyComponent>;

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
        CreatePolicyComponent,
        CreatePolicyWizardComponent,
        CreatePolicyModalComponent,
        WizardContentComponent,
        WizardSummaryComponent,
        SummaryTreeComponent
      ],
      providers: [
        NavbarService,
        PolicyService,
        JobService,
        FrequencyPipe,
        AsyncActionsService,
        HdfsService,
        HiveService
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreatePolicyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
