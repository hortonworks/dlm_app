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
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { ReactiveFormsModule } from '@angular/forms';
import { NotificationsPageComponent } from './notifications.component';
import { NotificationsTableComponent } from './notifications-table/notifications-table.component';
import { TableComponent } from 'common/table/table.component';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { Store } from '@ngrx/store';
import { MomentModule } from 'angular2-moment';
import { TableFooterComponent } from 'common/table/table-footer/table-footer.component';
import { MockTranslateLoader } from 'mocks/mock-translate-loader';
import { RouterTestingModule } from '@angular/router/testing';
import { CheckboxColumnComponent, ActionColumnComponent } from 'components/table-columns';
import { CheckboxComponent } from 'common/checkbox/checkbox.component';
import { FormsModule } from '@angular/forms';
import { NavbarService } from 'services/navbar.service';
import { PipesModule } from 'pipes/pipes.module';
import { CommonComponentsModule } from 'components/common-components.module';
import { HortonStyleModule } from 'common/horton-style.module';
import { ModalModule, TooltipModule } from 'ngx-bootstrap';
import { LogModalDialogComponent } from 'components/log-modal-dialog/log-modal-dialog.component';
import { LogService } from 'services/log.service';
import {MockBackend} from '@angular/http/testing';
import {BaseRequestOptions, ConnectionBackend, Http, RequestOptions} from '@angular/http';
import { NotificationService } from 'services/notification.service';
import { ClipboardModule } from 'ngx-clipboard';
import { configureComponentTest } from 'testing/configure';
import { AsyncActionsService } from 'services/async-actions.service';

describe('NotificationsPageComponent', () => {
  let component: NotificationsPageComponent;
  let fixture: ComponentFixture<NotificationsPageComponent>;

  beforeEach(async(() => {
    configureComponentTest({
      imports: [
        ReactiveFormsModule,
        RouterTestingModule,
        NgxDatatableModule,
        ModalModule.forRoot(),
        MomentModule,
        FormsModule,
        CommonComponentsModule,
        PipesModule,
        HortonStyleModule,
        TooltipModule.forRoot(),
        ClipboardModule
      ],
      declarations: [
        NotificationsPageComponent,
        NotificationsTableComponent,
        LogModalDialogComponent
      ],
      providers: [
        NavbarService,
        {
          provide: NotificationService,
          useValue: jasmine.createSpyObj('notificationService', ['create'])
        },
        LogService,
        AsyncActionsService
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NotificationsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
