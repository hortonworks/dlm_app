/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { TypeaheadModule, TooltipModule, ProgressbarModule } from 'ngx-bootstrap';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { CommonComponentsModule } from 'components/common-components.module';
import { FormsModule } from '@angular/forms';
import { MomentModule } from 'angular2-moment';

import { PolicyDetailsComponent } from './policy-details.component';
import { JobsTableComponent } from '../../jobs/jobs-table/jobs-table.component';
import { NavbarService } from 'services/navbar.service';
import { PipesModule } from 'pipes/pipes.module';
import { LogService } from 'services/log.service';
import { NotificationService } from 'services/notification.service';
import { configureComponentTest } from 'testing/configure';
import { SummaryTreeComponent } from '../components/summary-tree/summary-tree.component';
import { FrequencyPipe } from 'pipes/frequency.pipe';
import { FmtTzPipe } from 'pipes/fmt-tz.pipe';

describe('PolicyDetailsComponent', () => {
  let component: PolicyDetailsComponent;
  let fixture: ComponentFixture<PolicyDetailsComponent>;

  beforeEach(async(() => {
    configureComponentTest({
      imports: [
        NgxDatatableModule,
        CommonComponentsModule,
        FormsModule,
        MomentModule,
        TooltipModule.forRoot(),
        ProgressbarModule.forRoot(),
        TypeaheadModule.forRoot(),
        PipesModule
      ],
      declarations: [
        PolicyDetailsComponent,
        JobsTableComponent,
        SummaryTreeComponent
      ],
      providers: [
        NavbarService,
        {
          provide: NotificationService,
          useValue: jasmine.createSpyObj('notificationService', ['create'])
        },
        LogService,
        FmtTzPipe,
        FrequencyPipe
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
