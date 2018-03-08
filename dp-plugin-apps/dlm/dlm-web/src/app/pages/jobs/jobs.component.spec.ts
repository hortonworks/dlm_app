/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {JobsTableComponent} from './jobs-table/jobs-table.component';
import {TableComponent} from '../../common/table/table.component';
import {NgxDatatableModule} from '@swimlane/ngx-datatable';
import {JobsComponent} from './jobs.component';
import {CheckboxColumnComponent, ActionColumnComponent} from '../../components/table-columns';
import {CheckboxComponent} from '../../common/checkbox/checkbox.component';
import {FormsModule} from '@angular/forms';
import {MomentModule} from 'angular2-moment';
import {RouterTestingModule} from '@angular/router/testing';
import {TableFooterComponent} from '../../common/table/table-footer/table-footer.component';
import { TableFilterComponent } from '../../common/table/table-filter/table-filter.component';
import { TypeaheadModule, TooltipModule, ProgressbarModule, BsDropdownModule } from 'ngx-bootstrap';
import { JobsStatusFilterComponent } from './jobs-status-filter/jobs-status-filter.component';
import { NavbarService } from 'services/navbar.service';
import { PipesModule } from 'pipes/pipes.module';
import { LogService } from 'services/log.service';
import { CommonComponentsModule } from 'components/common-components.module';
import { NotificationService } from 'services/notification.service';
import { configureComponentTest } from 'testing/configure';

describe('JobsComponent', () => {
  let component: JobsComponent;
  let fixture: ComponentFixture<JobsComponent>;

  beforeEach(async(() => {
    configureComponentTest({
      imports: [
        TypeaheadModule.forRoot(), NgxDatatableModule, FormsModule, MomentModule, RouterTestingModule,
        TooltipModule.forRoot(),
        ProgressbarModule.forRoot(),
        PipesModule,
        BsDropdownModule.forRoot(),
        CommonComponentsModule
      ],
      declarations: [
        JobsComponent,
        JobsTableComponent,
        JobsStatusFilterComponent
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
    fixture = TestBed.createComponent(JobsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
