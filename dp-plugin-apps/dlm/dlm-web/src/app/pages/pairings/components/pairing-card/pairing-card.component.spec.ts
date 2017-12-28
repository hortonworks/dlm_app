/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {ClusterCardComponent} from '../../../../components/cluster-card/cluster-card.component';
import {PairingCardComponent} from './pairing-card.component';
import {Pairing} from 'models/pairing.model';
import {TooltipModule} from 'ngx-bootstrap';

describe('PairingCardComponent', () => {
  let component: PairingCardComponent;
  let fixture: ComponentFixture<PairingCardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        TooltipModule.forRoot()
      ],
      declarations: [PairingCardComponent, ClusterCardComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PairingCardComponent);
    component = fixture.componentInstance;
    component.pairing = <Pairing>{id: '1', pair: [{ location: {} }, { location: {} }]};
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
