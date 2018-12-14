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

import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { CloudAccountsComponent } from './cloud-accounts.component';
import { CloudAccountService } from 'services/cloud-account.service';
import { NotificationService } from 'services/notification.service';
import { AsyncActionsService } from 'services/async-actions.service';
import { MockComponent } from 'testing/mock-component';
import { Store } from '@ngrx/store';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TranslateTestingModule } from 'testing/translate-testing.module';
import {
  cloudAccountStub, notificationStub, storeStub, asyncActionsStub,
  userServiceStub
} from 'testing/mock-services';
import { UserService } from 'services/user.service';
import { TooltipModule } from 'ngx-bootstrap';

describe('CloudAccountsComponent', () => {
  let component: CloudAccountsComponent;
  let fixture: ComponentFixture<CloudAccountsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        TranslateTestingModule,
        HttpClientTestingModule,
        TooltipModule.forRoot()
      ],
      declarations: [
        CloudAccountsComponent,
        MockComponent({ selector: 'dlm-cloud-accounts-list', inputs: ['isSyncInProgress', 'accounts'] }),
        MockComponent({ selector: 'dlm-cloud-account-actions' }),
        MockComponent({ selector: 'dlm-add-cloud-form', inputs: ['progress', 'accounts', 'account'] }),
        MockComponent({ selector: 'dlm-add-account-modal' }),
        MockComponent({ selector: 'dlm-cloud-account-policies-table' }),
        MockComponent({ selector: 'dlm-prev-jobs' }),
        MockComponent({ selector: 'dlm-page-header', inputs: ['isFlexCenter', 'helpLinkIcon', 'contextMessage'] }),
        MockComponent({ selector: 'dlm-beacon-validity' }),
        MockComponent({ selector: 'dlm-progress-container', inputs: ['progressState'] }),
      ],
      providers: [
        { provide: CloudAccountService, useValue: cloudAccountStub },
        { provide: NotificationService, useValue: notificationStub },
        { provide: Store, useValue: storeStub },
        { provide: AsyncActionsService, useValue: asyncActionsStub },
        { provide: UserService, useValue: userServiceStub },
      ]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CloudAccountsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
