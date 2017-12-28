/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {TranslateLoader, TranslateModule} from '@ngx-translate/core';
import {Store} from '@ngrx/store';
import { CommonComponentsModule } from 'components/common-components.module';
import { HortonStyleModule } from 'common/horton-style.module';
import {ReviewPolicyComponent} from './review-policy.component';
import {NavbarService} from 'services/navbar.service';
import { RouterTestingModule } from '@angular/router/testing';
import { PipesModule } from 'pipes/pipes.module';
import {FrequencyPipe} from 'pipes/frequency.pipe';
import { ModalModule } from 'ngx-bootstrap';
import { configureComponentTest } from 'testing/configure';

describe('ReviewPolicyComponent', () => {
  let component: ReviewPolicyComponent;
  let fixture: ComponentFixture<ReviewPolicyComponent>;

  beforeEach(async(() => {
    configureComponentTest({
      imports: [
        ModalModule.forRoot(),
        CommonComponentsModule,
        RouterTestingModule,
        PipesModule,
        HortonStyleModule
      ],
      declarations: [
        ReviewPolicyComponent
      ],
      providers: [
        NavbarService,
        FrequencyPipe
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReviewPolicyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
