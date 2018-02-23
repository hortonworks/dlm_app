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
        WizardContentComponent
      ],
      providers: [
        NavbarService,
        PolicyService,
        JobService
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
