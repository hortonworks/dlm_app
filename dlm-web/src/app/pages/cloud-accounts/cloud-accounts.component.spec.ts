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
import {CloudAccountsComponent} from './cloud-accounts.component';
import {CloudAccountsListComponent} from './components/cloud-accounts-list/cloud-accounts-list.component';
import {TranslateLoader, TranslateModule} from '@ngx-translate/core';
import {configureComponentTest} from 'testing/configure';
import {RouterTestingModule} from '@angular/router/testing';
import {ModalModule, BsDropdownModule} from 'ngx-bootstrap';
import {HortonStyleModule} from 'common/horton-style.module';
import {MockTranslateLoader} from 'mocks/mock-translate-loader';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {NgxDatatableModule} from '@swimlane/ngx-datatable';
import {CloudAccountActionsComponent} from './components/cloud-account-actions/cloud-account-actions.component';
import {AddCloudFormComponent} from './components/add-cloud-form/add-cloud-form.component';
import {AddAccountModalComponent} from './components/add-account-modal/add-account-modal.component';
import {CloudAccountService} from 'services/cloud-account.service';
import {TooltipModule} from 'ngx-bootstrap';
import {CloudAccountsPoliciesTableComponent} from './components/cloud-account-policies-table/cloud-account-policies-table.component';
import {PrevJobsComponent} from '../policies/components/prev-jobs/prev-jobs.component';
import {MomentModule} from 'angular2-moment';
import {PipesModule} from 'pipes/pipes.module';
import { NotificationService } from 'services/notification.service';
import { AsyncActionsService } from 'services/async-actions.service';

describe('CloudAccountsComponent', () => {
  let component: CloudAccountsComponent;
  let fixture: ComponentFixture<CloudAccountsComponent>;

  beforeEach(async(() => {
    configureComponentTest({
      imports: [
        RouterTestingModule,
        TooltipModule,
        ModalModule.forRoot(),
        TranslateModule.forRoot({
          loader: {provide: TranslateLoader, useClass: MockTranslateLoader}
        }),
        BsDropdownModule.forRoot(),
        NgxDatatableModule,
        FormsModule,
        ReactiveFormsModule,
        CommonComponentsModule,
        HortonStyleModule,
        MomentModule,
        PipesModule
      ],
      declarations: [
        CloudAccountsComponent,
        CloudAccountsListComponent,
        CloudAccountActionsComponent,
        AddCloudFormComponent,
        AddAccountModalComponent,
        CloudAccountsPoliciesTableComponent,
        PrevJobsComponent
      ],
      providers: [
        CloudAccountService,
        NotificationService,
        AsyncActionsService
      ]
    })
      .compileComponents();
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
