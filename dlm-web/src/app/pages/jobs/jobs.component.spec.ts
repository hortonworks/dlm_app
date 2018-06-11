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
import { AsyncActionsService } from 'services/async-actions.service';

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
        LogService,
        AsyncActionsService
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
