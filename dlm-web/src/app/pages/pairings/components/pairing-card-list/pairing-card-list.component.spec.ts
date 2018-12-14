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

import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {PairingCardListComponent} from './pairing-card-list.component';
import {TooltipModule} from 'ngx-bootstrap';
import {Cluster} from 'models/cluster.model';
import {Pairing} from 'models/pairing.model';
import {RouterTestingModule} from '@angular/router/testing';
import { TranslateTestingModule } from 'testing/translate-testing.module';
import { MockComponent } from 'testing/mock-component';

describe('PairingCardListComponent', () => {
  let component: PairingCardListComponent;
  let fixture: ComponentFixture<PairingCardListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        TooltipModule.forRoot(),
        TranslateTestingModule,
        RouterTestingModule
      ],
      declarations: [
        PairingCardListComponent,
        MockComponent({selector: 'dlm-pairing-card', inputs: ['pairing', 'isSuspended']}),
        MockComponent({selector: 'dlm-cluster-card'})
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PairingCardListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    component.pairings = [
      <Pairing>{
        id: '1-2',
        cluster1: <Cluster>{
          id: 1,
          name: 'c1'
        },
        cluster2: <Cluster>{
          id: 2,
          name: 'c2'
        },
        status: 'PAIRED'
      }
    ];
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should list correct number of active pairings', () => {
    expect(component.activePairings.length).toEqual(1);
  });

  it('should list correct number of suspended pairings', () => {
    expect(component.suspendedPairings.length).toEqual(0);
    component.pairings[0].status = 'SUSPENDED';
    expect(component.suspendedPairings.length).toEqual(1);
  });
});
