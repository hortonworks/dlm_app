/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {CommonComponentsModule} from 'components/common-components.module';
import {TranslateLoader, TranslateModule} from '@ngx-translate/core';
import {configureComponentTest} from 'testing/configure';
import {RouterTestingModule} from '@angular/router/testing';
import {HortonStyleModule} from 'common/horton-style.module';
import {MockTranslateLoader} from 'mocks/mock-translate-loader';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {AddCloudFormComponent} from './add-cloud-form.component';
import {CloudAccountService} from 'services/cloud-account.service';
import {NotificationService} from 'services/notification.service';
import { AsyncActionsService } from 'services/async-actions.service';
import { ChangeDetectorRef } from '@angular/core';

describe('AddCloudFormComponent', () => {
  let component: AddCloudFormComponent;
  let fixture: ComponentFixture<AddCloudFormComponent>;

  beforeEach(async(() => {
    configureComponentTest({
      imports: [
        RouterTestingModule,
        TranslateModule.forRoot({
          loader: {provide: TranslateLoader, useClass: MockTranslateLoader}
        }),
        FormsModule,
        ReactiveFormsModule,
        CommonComponentsModule,
        HortonStyleModule
      ],
      declarations: [
        AddCloudFormComponent
      ],
      providers: [
        CloudAccountService,
        NotificationService,
        AsyncActionsService,
        ChangeDetectorRef
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddCloudFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
