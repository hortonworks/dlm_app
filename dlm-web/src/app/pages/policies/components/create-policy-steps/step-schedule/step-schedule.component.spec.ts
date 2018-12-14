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
import { TooltipModule, TimepickerComponent, TimepickerConfig } from 'ngx-bootstrap';
import { RouterTestingModule } from '@angular/router/testing';
import { StepScheduleComponent } from './step-schedule.component';
import { PipesModule } from 'pipes/pipes.module';
import { PolicyWizardService } from 'services/policy-wizard.service';
import { TranslateTestingModule } from 'testing/translate-testing.module';
import { RadioButtonComponent } from 'common/radio-button/radio-button.component';
import { MockComponent } from 'testing/mock-component';
import { TimeZoneService } from 'services/time-zone.service';
import { policyWizardStub, timeZoneStub, timepickerActionsStub, timepickerConfigStub } from 'testing/mock-services';
import { SelectFieldComponent } from 'components/forms/select-field';
import { TimepickerActions } from 'ngx-bootstrap/timepicker';

describe('StepScheduleComponent', () => {
  let component: StepScheduleComponent;
  let fixture: ComponentFixture<StepScheduleComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        TranslateTestingModule,
        TooltipModule.forRoot(),
        ReactiveFormsModule,
        RouterTestingModule,
        PipesModule,
      ],
      declarations: [
        StepScheduleComponent,
        RadioButtonComponent,
        SelectFieldComponent,
        TimepickerComponent,
        MockComponent({ selector: 'dlm-field-label', inputs: ['required'] }),
        MockComponent({ selector: 'dlm-field-error' }),
        MockComponent({ selector: 'my-date-picker', inputs: ['selDate', 'placeholder', 'options', 'disabled'] }),
        MockComponent({ selector: 'dlm-help-link', inputs: ['iconHint', 'placement', ] }),

      ],
      providers: [
        { provide: TimeZoneService, useValue: timeZoneStub },
        { provide: TimepickerConfig, useValue: timepickerConfigStub },
        { provide: TimepickerActions, useValue: timepickerActionsStub },
        { provide: PolicyWizardService, useValue: policyWizardStub }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StepScheduleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
