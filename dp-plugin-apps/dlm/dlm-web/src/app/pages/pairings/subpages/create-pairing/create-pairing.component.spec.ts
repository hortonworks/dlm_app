/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { CreatePairingComponent } from './create-pairing.component';
import { CreatePairingCardListComponent } from 'pages/pairings/components/create-pairing-card-list/create-pairing-card-list.component';
import { PairingProgressCardComponent } from 'pages/pairings/components/pairing-progress-card/pairing-progress-card.component';
import { CreatePairingCardComponent } from 'pages/pairings/components/create-pairing-card/create-pairing-card.component';
import { ModalModule } from 'ngx-bootstrap';
import { RouterTestingModule } from '@angular/router/testing';
import { TooltipModule } from 'ngx-bootstrap';
import { CommonComponentsModule } from 'components/common-components.module';
import { NotificationService } from 'services/notification.service';
import { PipesModule } from 'pipes/pipes.module';
import { HortonStyleModule } from 'common/horton-style.module';
import { configureComponentTest } from 'testing/configure';

describe('CreatePairingComponent', () => {
  let component: CreatePairingComponent;
  let fixture: ComponentFixture<CreatePairingComponent>;

  beforeEach(async(() => {
    configureComponentTest({
      imports: [
        ReactiveFormsModule,
        ModalModule.forRoot(),
        RouterTestingModule,
        TooltipModule.forRoot(),
        CommonComponentsModule,
        PipesModule,
        HortonStyleModule
      ],
      declarations: [
        CreatePairingComponent,
        CreatePairingCardListComponent,
        PairingProgressCardComponent,
        CreatePairingCardComponent
      ],
      providers: [
        {
          provide: NotificationService,
          useValue: jasmine.createSpyObj('notificationService', ['create'])
        }
      ]
    })
      .compileComponents();
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
