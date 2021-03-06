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
