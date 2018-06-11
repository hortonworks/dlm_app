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
import { MomentModule } from 'angular2-moment';
import { ModalModule } from 'ngx-bootstrap';
import { MockTranslateLoader } from 'mocks/mock-translate-loader';
import { PoliciesComponent } from './policies.component';
import { PolicyTableComponent } from './policy-table/policy-table.component';
import { TableComponent } from 'common/table/table.component';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { ActionColumnComponent } from 'components/table-columns/action-column/action-column.component';
import { CheckboxComponent } from 'common/checkbox/checkbox.component';
import { CheckboxColumnComponent } from 'components/table-columns/checkbox-column/checkbox-column.component';
import { CommonComponentsModule } from 'components/common-components.module';
import { PolicyInfoComponent } from './policy-table/policy-info/policy-info.component';
import { FlowStatusComponent } from './policy-table/flow-status/flow-status.component';
import { FormsModule } from '@angular/forms';
import { RouterTestingModule } from '@angular/router/testing';
import { TableFooterComponent } from 'common/table/table-footer/table-footer.component';
import { NavbarService } from 'services/navbar.service';
import { PipesModule } from 'pipes/pipes.module';
import { PolicyDetailsComponent } from './policy-details/policy-details.component';
import { JobsTableComponent } from '../jobs/jobs-table/jobs-table.component';
import { TableFilterComponent } from 'common/table/table-filter/table-filter.component';
import { PolicyServiceFilterComponent } from './components/policy-service-filter/policy-service-filter.component';
import { TypeaheadModule, TooltipModule } from 'ngx-bootstrap';
import { HortonStyleModule } from 'common/horton-style.module';
import { PrevJobsComponent } from './components/prev-jobs/prev-jobs.component';
import { HdfsBrowserComponent } from 'components/hdfs-browser/hdfs-browser.component';
import { configureComponentTest } from 'testing/configure';
import { AsyncActionsService } from 'services/async-actions.service';
import { SummaryTreeComponent } from './components/summary-tree/summary-tree.component';

describe('PoliciesComponent', () => {
  let component: PoliciesComponent;
  let fixture: ComponentFixture<PoliciesComponent>;

  beforeEach(async(() => {
    configureComponentTest({
      imports: [
        RouterTestingModule,
        TranslateModule.forRoot({
          loader: {provide: TranslateLoader, useClass: MockTranslateLoader}
        }),
        NgxDatatableModule,
        FormsModule,
        PipesModule,
        CommonComponentsModule,
        HortonStyleModule,
        MomentModule,
        ModalModule.forRoot(),
        TypeaheadModule,
        TooltipModule.forRoot()
      ],
      declarations: [
        PoliciesComponent,
        PolicyTableComponent,
        PolicyInfoComponent,
        FlowStatusComponent,
        PolicyDetailsComponent,
        JobsTableComponent,
        PolicyServiceFilterComponent,
        PrevJobsComponent,
        SummaryTreeComponent
      ],
      providers: [
        AsyncActionsService,
        NavbarService
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PoliciesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
