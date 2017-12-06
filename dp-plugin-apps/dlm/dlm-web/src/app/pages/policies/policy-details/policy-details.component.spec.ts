/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { ChartsModule } from 'ng2-charts/ng2-charts';
import { TypeaheadModule, TooltipModule, ProgressbarModule } from 'ng2-bootstrap';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { CommonComponentsModule } from 'components/common-components.module';
import { FormsModule } from '@angular/forms';
import { MomentModule } from 'angular2-moment';

import { PolicyDetailsComponent } from './policy-details.component';
import { JobsTableComponent } from '../../jobs/jobs-table/jobs-table.component';
import { JobTransferredGraphComponent } from '../../jobs/jobs-transferred-graph/job-transferred-graph.component';
import { TableFooterComponent } from 'common/table/table-footer/table-footer.component';
import { TableComponent } from 'common/table/table.component';
import { HdfsBrowserComponent } from 'components/hdfs-browser/hdfs-browser.component';
import { CheckboxComponent } from 'common/checkbox/checkbox.component';
import { ActionColumnComponent } from 'components/table-columns/action-column/action-column.component';
import { CheckboxColumnComponent } from 'components/table-columns/checkbox-column/checkbox-column.component';
import { MockTranslateLoader } from 'mocks/mock-translate-loader';
import { NavbarService } from 'services/navbar.service';
import { MockStore } from '../../../mocks/mock-store';
import { Store } from '@ngrx/store';
import { PipesModule } from 'pipes/pipes.module';
import { LogService } from 'services/log.service';
import {MockBackend} from '@angular/http/testing';
import {BaseRequestOptions, ConnectionBackend, Http, RequestOptions} from '@angular/http';
import {HttpService} from 'services/http.service';
import { NotificationService } from 'services/notification.service';
import { TableFilterComponent } from 'common/table/table-filter/table-filter.component';

describe('PolicyDetailsComponent', () => {
  let component: PolicyDetailsComponent;
  let fixture: ComponentFixture<PolicyDetailsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot({
          loader: {provide: TranslateLoader, useClass: MockTranslateLoader}
        }),
        ChartsModule, NgxDatatableModule, CommonComponentsModule, FormsModule, MomentModule, TooltipModule.forRoot(),
        ProgressbarModule.forRoot(), TypeaheadModule.forRoot(),
        PipesModule
      ],
      declarations: [
        PolicyDetailsComponent,
        ActionColumnComponent,
        CheckboxColumnComponent,
        CheckboxComponent,
        TableComponent,
        TableFooterComponent,
        TableFilterComponent,
        JobsTableComponent,
        JobTransferredGraphComponent,
        HdfsBrowserComponent
      ],
      providers: [
        {provide: ConnectionBackend, useClass: MockBackend},
        {provide: RequestOptions, useClass: BaseRequestOptions},
        {provide: Http, useClass: HttpService},
        Http,
        HttpService,
        NavbarService,
        {
          provide: NotificationService,
          useValue: jasmine.createSpyObj('notificationService', ['create'])
        },
        LogService,
        {provide: Store, useClass: MockStore}
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PolicyDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
