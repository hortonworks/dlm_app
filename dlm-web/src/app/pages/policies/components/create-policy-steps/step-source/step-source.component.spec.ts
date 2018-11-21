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
import { StepSourceComponent } from './step-source.component';
import { HdfsService } from 'services/hdfs.service';
import { HiveService } from 'services/hive.service';
import { BeaconService } from 'services/beacon.service';
import { FeatureService } from 'services/feature.service';
import { ClusterService } from 'services/cluster.service';
import { PolicyWizardService } from 'services/policy-wizard.service';
import { TranslateTestingModule } from 'testing/translate-testing.module';
import { Store } from '@ngrx/store';
import { storeStub, hdfsStub, hiveStub, policyWizardStub, clusterStub } from 'testing/mock-services';
import { SelectFieldComponent } from 'components/forms/select-field';
import { MockComponent } from 'testing/mock-component';
import { HiveBrowserComponent } from 'components/hive-browser';


describe('StepSourceComponent', () => {
  let component: StepSourceComponent;
  let fixture: ComponentFixture<StepSourceComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        TranslateTestingModule,
        RouterTestingModule,
        TooltipModule.forRoot(),
        ReactiveFormsModule,
      ],
      declarations: [
        StepSourceComponent,
        SelectFieldComponent,
        HiveBrowserComponent,
        MockComponent({selector: 'dlm-form-field', inputs: ['label', 'fieldClass', 'errorClass', 'required']}),
        MockComponent({selector: 'dlm-field-error', inputs: ['isError', 'isWarning']}),
        MockComponent({selector: 'dlm-spinner'}),
        MockComponent({selector: 'dlm-checkbox', inputs: ['disabled', 'checked']}),
        MockComponent({selector: 'dlm-help-link', inputs: ['linkTo', 'linkText']}),
        MockComponent({selector: 'dlm-hdfs-browser', inputs: ['rootPath', 'cluster']}),
        MockComponent({selector: 'dlm-search-input', inputs: ['value']}),
        MockComponent({selector: 'dlm-progress-container', inputs: ['progressState']}),
        MockComponent({selector: 'dlm-hive-database', inputs: ['tablesLoading', 'searchPattern', 'selectedDatabase',
        'readonly', 'database']})
      ],
      providers: [
        { provide: Store, useValue: storeStub },
        { provide: HdfsService, useValue: hdfsStub },
        { provide: HiveService, useValue: hiveStub },
        { provide: BeaconService, useValue: {} },
        { provide: FeatureService, useValue: {} },
        { provide: PolicyWizardService, useValue: policyWizardStub },
        { provide: ClusterService, useValue: clusterStub }
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StepSourceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
