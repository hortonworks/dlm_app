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
import { ReactiveFormsModule } from '@angular/forms';
import { TooltipModule } from 'ngx-bootstrap';
import { RouterTestingModule } from '@angular/router/testing';
import { CreatePolicyWizardComponent } from './create-policy-wizard.component';
import { AsyncActionsService } from 'services/async-actions.service';
import { Step } from 'models/wizard.model';
import { TranslateTestingModule } from 'testing/translate-testing.module';
import { MockComponent } from 'testing/mock-component';
import { asyncActionsStub, policyWizardStub } from 'testing/mock-services';
import { StoreModule } from '@ngrx/store';
import { PolicyWizardService } from 'services/policy-wizard.service';
import { reducers } from 'reducers';

describe('CreatePolicyWizardComponent', () => {
  let component: CreatePolicyWizardComponent;
  let fixture: ComponentFixture<CreatePolicyWizardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        TranslateTestingModule,
        TooltipModule.forRoot(),
        StoreModule.forRoot(reducers, {
          initialState: {}
        }),
        ReactiveFormsModule,
        RouterTestingModule,
      ],
      declarations: [
        CreatePolicyWizardComponent,
        MockComponent({ selector: 'tabset', inputs: ['vertical'] }),
        MockComponent({ selector: 'tab', inputs: ['active', 'disabled', 'customClass'] }),
        MockComponent({ selector: 'dlm-wizard-content', inputs: ['stepIndex', 'stepLabel', 'showSummary'] }),
        MockComponent({ selector: 'dlm-step-source', inputs: ['accounts', 'clusters', 'pairings', 'sourceClusterId'] }),
        MockComponent({ selector: 'dlm-step-advanced', inputs: ['clusters', 'policy'] }),
        MockComponent({ selector: 'dlm-wizard-summary-content', inputs: ['stepId', 'clusters'] }),
        MockComponent({ selector: 'dlm-spinner', inputs: ['size'] }),
        MockComponent({ selector: 'dlm-step-schedule', inputs: ['policy'] }),
        MockComponent({ selector: 'dlm-step-destination', inputs: ['accounts', 'clusters', 'pairings'] }),
        MockComponent({ selector: 'dlm-step-general' })
      ],
      providers: [
        { provide: AsyncActionsService, useValue: asyncActionsStub },
        { provide: PolicyWizardService, useValue: policyWizardStub }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreatePolicyWizardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display correct NextButton text', () => {
    component._steps = [
      <Step>{ id: 'general', label: 'step1', nextStepId: 'source' },
      <Step>{ id: 'source', label: 'step2', nextStepId: null }
    ];
    component.activeStepId = 'general';
    expect(component.getNextButtonText).toBe('step2');
    component.activeStepId = 'source';
    expect(component.getNextButtonText).toBe('page.policies.subpage.create_policy.buttons.create_policy');
  });

  it('should disable back button when there is no previous step', () => {
    component._steps = [
      <Step>{ id: 'general', label: 'step1', previousStepId: null },
      <Step>{ id: 'source', label: 'step2', previousStepId: 'general' }
    ];
    component.activeStepId = 'general';
    expect(component.isBackButtonDisabled).toBe(true);
    component.activeStepId = 'source';
    expect(component.isBackButtonDisabled).toBe(false);
  });
});
