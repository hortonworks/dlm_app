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
import { CreatePairingComponent } from './create-pairing.component';
import { RouterTestingModule } from '@angular/router/testing';
import { MockComponent } from 'testing/mock-component';
import { TranslateTestingModule } from 'testing/translate-testing.module';
import { StoreModule } from '@ngrx/store';
import { reducers } from 'reducers';

describe('CreatePairingComponent', () => {
  let component: CreatePairingComponent;
  let fixture: ComponentFixture<CreatePairingComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        TranslateTestingModule,
        ReactiveFormsModule,
        RouterTestingModule,
        StoreModule.forRoot(reducers, {
          initialState: {}
        }),
      ],
      declarations: [
        CreatePairingComponent,
        MockComponent({ selector: 'dlm-create-pairing-card-list', inputs: ['clusters', 'selectedCluster', 'isFrozen'] }),
        MockComponent({ selector: 'dlm-pairing-progress-card', inputs: ['firstCluster', 'isCompleted', 'secondCluster'] }),
        MockComponent({ selector: 'dlm-create-pairing-card' }),
        MockComponent({ selector: 'dlm-page-header', inputs: ['isFlexCenter', 'linkText', 'linkTo'] }),
        MockComponent({ selector: 'dlm-progress-container', inputs: ['progressState'] }),
        MockComponent({ selector: 'dlm-modal-dialog', inputs: ['showDialog', 'showCancel'] }),
        MockComponent({ selector: 'dlm-modal-dialog-body' })
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreatePairingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
