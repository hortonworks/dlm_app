/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {ClusterCardComponent} from 'components/cluster-card/cluster-card.component';
import {PairingProgressCardComponent} from './pairing-progress-card.component';
import {Cluster} from 'models/cluster.model';
import {TooltipModule} from 'ngx-bootstrap';

describe('PairingProgressCardComponent', () => {
  let component: PairingProgressCardComponent;
  let fixture: ComponentFixture<PairingProgressCardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [TooltipModule.forRoot()],
      declarations: [PairingProgressCardComponent, ClusterCardComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PairingProgressCardComponent);
    component = fixture.componentInstance;
    component.firstCluster = <Cluster>{location: {}};
    component.secondCluster = <Cluster>{location: {}};
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
