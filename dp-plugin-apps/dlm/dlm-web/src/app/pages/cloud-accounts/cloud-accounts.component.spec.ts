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
