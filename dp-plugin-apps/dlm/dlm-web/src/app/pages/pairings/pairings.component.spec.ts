/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {PairingsComponent} from './pairings.component';
import {RouterTestingModule} from '@angular/router/testing';
import {PairingCardListComponent} from './components/pairing-card-list/pairing-card-list.component';
import {PairingCardComponent} from './components/pairing-card/pairing-card.component';
import {ModalModule, TooltipModule} from 'ngx-bootstrap';
import { CommonComponentsModule } from 'components/common-components.module';
import { PipesModule } from 'pipes/pipes.module';
import { HortonStyleModule } from 'common/horton-style.module';
import { configureComponentTest } from 'testing/configure';

describe('PairingsComponent', () => {
  let component: PairingsComponent;
  let fixture: ComponentFixture<PairingsComponent>;

  beforeEach(async(() => {
    configureComponentTest({
      imports: [
        RouterTestingModule,
        ModalModule.forRoot(),
        CommonComponentsModule,
        PipesModule,
        TooltipModule.forRoot(),
        HortonStyleModule
      ],
      declarations: [
        PairingsComponent,
        PairingCardComponent,
        PairingCardListComponent
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PairingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
