/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {PairingCardComponent} from '../pairing-card/pairing-card.component';
import {PairingCardListComponent} from './pairing-card-list.component';
import {ClusterCardComponent} from 'components/cluster-card/cluster-card.component';
import {TooltipModule} from 'ngx-bootstrap';

describe('PairingCardListComponent', () => {
  let component: PairingCardListComponent;
  let fixture: ComponentFixture<PairingCardListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        TooltipModule.forRoot()
      ],
      declarations: [PairingCardListComponent, PairingCardComponent, ClusterCardComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PairingCardListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
