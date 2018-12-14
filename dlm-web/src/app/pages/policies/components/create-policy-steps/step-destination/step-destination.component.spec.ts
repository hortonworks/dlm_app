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
import { AsyncActionsService } from 'services/async-actions.service';
import { StepDestinationComponent } from './step-destination.component';
import { HdfsService } from 'services/hdfs.service';
import { HiveService } from 'services/hive.service';
import { AWS_ENCRYPTION, AWS_ENCRYPTION_LABELS, SOURCE_TYPES, POLICY_TYPES } from 'constants/policy.constant';
import { PipesModule } from 'pipes/pipes.module';
import { PolicyWizardService } from 'services/policy-wizard.service';
import { StepGeneralValue } from 'models/create-policy-form.model';
import { MockComponent } from 'testing/mock-component';
import { TranslateTestingModule } from 'testing/translate-testing.module';
import { SelectFieldComponent } from 'components/forms/select-field';
import { storeStub, asyncActionsStub, policyWizardStub, hiveStub, hdfsStub } from 'testing/mock-services';
import { Store } from '@ngrx/store';

describe('StepDestinationComponent', () => {
  let component: StepDestinationComponent;
  let fixture: ComponentFixture<StepDestinationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        TranslateTestingModule,
        RouterTestingModule,
        TooltipModule.forRoot(),
        ReactiveFormsModule,
        PipesModule
      ],
      declarations: [
        StepDestinationComponent,
        SelectFieldComponent,
        MockComponent({ selector: 'dlm-form-field', inputs: ['hint', 'label', 'fieldClass', 'errorClass', 'required'] }),
        MockComponent({ selector: 'dlm-field-error', inputs: ['isWarning', 'isError'] }),
        MockComponent({ selector: 'dlm-spinner', inputs: ['size'] }),
        MockComponent({ selector: 'dlm-checkbox' }),
        MockComponent({ selector: 'dlm-radio-button', inputs: ['items'] })
      ],
      providers: [
        { provide: Store, useValue: storeStub },
        { provide: HiveService, useValue: hiveStub },
        { provide: HdfsService, useValue: hdfsStub },
        { provide: AsyncActionsService, useValue: asyncActionsStub },
        { provide: PolicyWizardService, useValue: policyWizardStub }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StepDestinationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    component.general = <StepGeneralValue>{};
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Encryption Key', () => {
    it('should show encryption key', () => {
      component.form.patchValue({ destination: { cloudEncryption: AWS_ENCRYPTION.SSE_KMS, type: SOURCE_TYPES.S3 } });
      expect(component.shouldShowEncryptionKey).toBe(true);
      component.general['type'] = POLICY_TYPES.HIVE;
      component.form.patchValue({ destination: { cloudEncryption: AWS_ENCRYPTION_LABELS[AWS_ENCRYPTION.SSE_KMS], type: SOURCE_TYPES.S3 } });
      expect(component.shouldShowEncryptionKey).toBe(true);
    });

    it('should not show encryption key', () => {
      component.form.patchValue({ destination: { cloudEncryption: AWS_ENCRYPTION.SSE_KMS, type: SOURCE_TYPES.CLUSTER } });
      expect(component.shouldShowEncryptionKey).toBe(false);
    });
  });
});
