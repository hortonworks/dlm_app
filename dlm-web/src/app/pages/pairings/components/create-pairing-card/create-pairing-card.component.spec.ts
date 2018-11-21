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
import { CreatePairingCardComponent } from './create-pairing-card.component';
import { Cluster } from 'models/cluster.model';
import { TooltipModule } from 'ngx-bootstrap';
import { BytesSizePipe } from 'pipes/bytes-size.pipe';
import { StoreModule } from '@ngrx/store';
import { reducers } from 'reducers';
import { TranslateTestingModule } from 'testing/translate-testing.module';
import { MockComponent } from 'testing/mock-component';

describe('CreatePairingCardComponent', () => {
  let component: CreatePairingCardComponent;
  let fixture: ComponentFixture<CreatePairingCardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        TooltipModule.forRoot(),
        TranslateTestingModule,
        StoreModule.forRoot(reducers, {
          initialState: {}
        })
      ],
      declarations: [
        CreatePairingCardComponent,
        MockComponent({selector: 'dlm-cluster-card', inputs: ['isSelected', 'isDisabled']})
      ],
      providers: [
        BytesSizePipe
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreatePairingCardComponent);
    component = fixture.componentInstance;
    component.cluster = <Cluster>{
      id: 1,
      location: {},
      stats: {CapacityUsed: 1, CapacityRemaining: 4, CapacityTotal: 5}
    };
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
