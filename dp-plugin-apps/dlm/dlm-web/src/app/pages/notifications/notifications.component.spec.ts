/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
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
        TableComponent,
        TableFooterComponent,
        CheckboxColumnComponent,
        CheckboxComponent,
        ActionColumnComponent,
        LogModalDialogComponent
      ],
      providers: [
        NavbarService,
        {
          provide: NotificationService,
          useValue: jasmine.createSpyObj('notificationService', ['create'])
        },
        LogService
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
