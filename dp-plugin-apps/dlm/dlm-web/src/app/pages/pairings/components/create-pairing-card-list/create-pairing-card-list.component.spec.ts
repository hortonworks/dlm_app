/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ClusterCardComponent } from 'components/cluster-card/cluster-card.component';
import { CreatePairingCardComponent } from '../create-pairing-card/create-pairing-card.component';
import { CreatePairingCardListComponent } from './create-pairing-card-list.component';
import { BytesSizePipe } from 'pipes/bytes-size.pipe';
import { TooltipModule } from 'ng2-bootstrap';

describe('CreatePairingCardListComponent', () => {
  let component: CreatePairingCardListComponent;
  let fixture: ComponentFixture<CreatePairingCardListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [TooltipModule.forRoot()],
      declarations: [
        CreatePairingCardListComponent,
        CreatePairingCardComponent,
        ClusterCardComponent,
        BytesSizePipe
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreatePairingCardListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
