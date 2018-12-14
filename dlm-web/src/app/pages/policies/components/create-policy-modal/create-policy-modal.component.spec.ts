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
import { RouterTestingModule } from '@angular/router/testing';
import { CreatePolicyModalComponent } from './create-policy-modal.component';
import { PolicyService } from 'services/policy.service';
import { AsyncActionsService } from 'services/async-actions.service';
import { MockComponent } from 'testing/mock-component';
import { TranslateTestingModule } from 'testing/translate-testing.module';
import { Store } from '@ngrx/store';
import { policyStub, asyncActionsStub, policyWizardStub, storeStub, dlmPropertiesStub } from 'testing/mock-services';
import { PolicyWizardService } from 'services/policy-wizard.service';
import { DlmPropertiesService } from 'services/dlm-properties.service';

describe('CreatePolicyModalComponent', () => {
  let component: CreatePolicyModalComponent;
  let fixture: ComponentFixture<CreatePolicyModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        TranslateTestingModule,
        RouterTestingModule
      ],
      declarations: [
        CreatePolicyModalComponent,
        MockComponent({selector: 'dlm-create-policy-wizard', inputs: ['policy', 'accounts', 'clusters',
            'pairings', 'sourceClusterId']}),
        MockComponent({ selector: 'dlm-wizard-content', inputs: ['stepIndex', 'stepLabel', 'showSummary'] }),
        MockComponent({ selector: 'dlm-wizard-summary-content', inputs: ['stepId', 'clusters'] }),
        MockComponent({ selector: 'dlm-summary-tree' }),
        MockComponent({ selector: 'dlm-progress-container', inputs: ['progressState'] }),
        MockComponent({selector: 'dlm-modal-dialog', inputs: ['modalSize', 'showFooter', 'showOk', 'showCancel',
            'subtitleText', 'subtitleLink']}),
        MockComponent({ selector: 'dlm-modal-dialog-body' }),
        MockComponent({ selector: 'alert' })
      ],
      providers: [
        { provide: Store, useValue: storeStub },
        { provide: PolicyService, useValue: policyStub },
        { provide: PolicyWizardService, useValue: policyWizardStub },
        { provide: AsyncActionsService, useValue: asyncActionsStub },
        { provide: DlmPropertiesService, useValue: dlmPropertiesStub }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreatePolicyModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
