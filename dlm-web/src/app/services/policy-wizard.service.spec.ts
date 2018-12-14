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

import { TestBed, fakeAsync } from '@angular/core/testing';
import { EventEmitter } from '@angular/core';
import { FormGroup, Validators, FormBuilder } from '@angular/forms';
import { StoreModule, Store } from '@ngrx/store';

import { PolicyWizardService } from 'services/policy-wizard.service';
import { TimeZoneService } from 'services/time-zone.service';
import { reducers, State } from 'reducers';
import { WIZARD_STEP_ID } from 'constants/policy.constant';
import { wizardMoveToStep } from 'actions/policy.action';
import { StepComponent } from 'pages/policies/components/create-policy-wizard/step-component.type';
import { timeZoneStub } from 'testing/mock-services';

describe('PolicyWizardService', () => {
  let policyWizardService: PolicyWizardService;
  let storeService: Store<State>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        StoreModule.forRoot(reducers, {
          initialState: {}
        })
      ],
      providers: [
        PolicyWizardService,
        { provide: TimeZoneService, useValue: timeZoneStub }
      ]
    });

    policyWizardService = TestBed.get(PolicyWizardService);
    storeService = TestBed.get(Store);
  });

  it('should be created', () => {
    expect(policyWizardService).toBeTruthy();
  });

  describe('#activeStep$', () => {
    it('should emit value when active step changed', fakeAsync(() => {
      let generalCalled = 0;
      let sourceCalled = 0;
      let destinationCalled = 0;
      policyWizardService.activeStep$(WIZARD_STEP_ID.GENERAL).subscribe(step => {
        generalCalled++;
        expect(step).toBeTruthy();
        expect(step.id).toBe(WIZARD_STEP_ID.GENERAL);
      });
      policyWizardService.activeStep$(WIZARD_STEP_ID.SOURCE).subscribe(step => {
        sourceCalled++;
        expect(step).toBeTruthy();
        expect(step.id).toBe(WIZARD_STEP_ID.SOURCE);
      });
      policyWizardService.activeStep$(WIZARD_STEP_ID.DESTINATION).subscribe(step => {
        destinationCalled++;
        expect(step).toBeTruthy();
        expect(step.id).toBe(WIZARD_STEP_ID.SOURCE);
      });
      storeService.dispatch(wizardMoveToStep(WIZARD_STEP_ID.SOURCE));
      expect(generalCalled).toBe(1, 'general step selected initially, should not be selected after step switch');
      expect(sourceCalled).toBe(1, 'source step selected via action');
      expect(destinationCalled).toBe(0, 'destination step was not activated');
    }));
  });

  describe('#publishValidationStatus', () => {
    let generalFormStub: FormGroup;
    let sourceFormStub: FormGroup;
    let generalStepComponent: StepComponent;
    let sourceStepComponent: StepComponent;
    let generalEmitterSpy: jasmine.Spy;
    let sourceEmitterSpy: jasmine.Spy;
    let generalFormValidSpy: jasmine.Spy;
    let sourceFormValidSpy: jasmine.Spy;

    beforeEach(() => {
      const fb = new FormBuilder();
      generalFormStub = fb.group({
        testField: ['', Validators.required]
      });
      sourceFormStub = fb.group({
        testField: ['', Validators.required]
      });
      generalStepComponent = {
        stepId: WIZARD_STEP_ID.GENERAL,
        onFormValidityChange: new EventEmitter<any>(),
        getFormValue() { return {}; },
        isFormValid() { return false; }
      };
      sourceStepComponent = {
        stepId: WIZARD_STEP_ID.SOURCE,
        onFormValidityChange: new EventEmitter<any>(),
        getFormValue() { return {}; },
        isFormValid() { return false; }
      };

      generalEmitterSpy = spyOn(generalStepComponent.onFormValidityChange, 'emit');
      sourceEmitterSpy = spyOn(sourceStepComponent.onFormValidityChange, 'emit');
      generalFormValidSpy = spyOn(generalStepComponent, 'isFormValid');
      sourceFormValidSpy = spyOn(sourceStepComponent, 'isFormValid');
    });

    it('should publish form status for active step only', fakeAsync(() => {
      policyWizardService.publishValidationStatus(generalStepComponent, generalFormStub);
      policyWizardService.publishValidationStatus(sourceStepComponent, sourceFormStub);

      generalFormValidSpy.and.returnValue(false);
      sourceFormValidSpy.and.returnValue(true);

      generalFormStub.patchValue({ testField: null });
      sourceFormStub.patchValue({ testField: 1 });

      expect(generalFormValidSpy).toHaveBeenCalled();
      expect(generalEmitterSpy).toHaveBeenCalledWith(false);
      expect(sourceFormValidSpy).not.toHaveBeenCalled();
      expect(sourceEmitterSpy).not.toHaveBeenCalled();
    }));

    it('should publish form status after switching step', fakeAsync(() => {
      policyWizardService.publishValidationStatus(generalStepComponent, generalFormStub);
      policyWizardService.publishValidationStatus(sourceStepComponent, sourceFormStub);

      generalFormValidSpy.and.returnValue(false);
      sourceFormValidSpy.and.returnValue(true);

      generalFormStub.patchValue({ testField: null });
      sourceFormStub.patchValue({ testField: 1 });

      expect(generalEmitterSpy.calls.count()).toBe(1, 'general publisher sent validation status');
      expect(sourceFormValidSpy).not.toHaveBeenCalled();
      expect(sourceEmitterSpy).not.toHaveBeenCalled();
      // switch to next step
      storeService.dispatch(wizardMoveToStep(WIZARD_STEP_ID.SOURCE));

      sourceFormStub.patchValue({ testField: 2 });
      generalFormStub.patchValue({ testField: 3 });

      expect(sourceFormValidSpy).toHaveBeenCalled();
      expect(sourceEmitterSpy).toHaveBeenCalledWith(true);
      expect(generalEmitterSpy.calls.count()).toBe(1, 'general publisher should not send value since source step is active');
    }));
  });
});
