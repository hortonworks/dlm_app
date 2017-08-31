/*
 *
 *  * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *  *
 *  * Except as expressly permitted in a written agreement between you or your company
 *  * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 *  * reproduction, modification, redistribution, sharing, lending or other exploitation
 *  * of all or any part of the contents of this software is strictly prohibited.
 *
 */

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DpOnboardComponent } from './dp-onboard.component';

describe('DpOnboardComponent', () => {
  let component: DpOnboardComponent;
  let fixture: ComponentFixture<DpOnboardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DpOnboardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DpOnboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
