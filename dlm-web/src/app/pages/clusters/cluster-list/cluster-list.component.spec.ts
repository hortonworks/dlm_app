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
import { RouterTestingModule } from '@angular/router/testing';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { RouterModule } from '@angular/router';
import { CommonComponentsModule } from 'components/common-components.module';
import { TableComponent } from 'common/table/table.component';
import { TableFooterComponent } from 'common/table/table-footer/table-footer.component';
import { ActionColumnComponent } from 'components/table-columns/action-column/action-column.component';
import { CheckboxComponent } from 'common/checkbox/checkbox.component';
import { CheckboxColumnComponent } from 'components/table-columns/checkbox-column/checkbox-column.component';
import { ClusterListComponent } from './cluster-list.component';
import { TranslateModule } from '@ngx-translate/core';
import { BytesSizePipe } from 'pipes/bytes-size.pipe';
import { PipesModule } from 'pipes/pipes.module';
import { HdfsBrowserComponent } from 'components/hdfs-browser/hdfs-browser.component';
import { FormsModule } from '@angular/forms';
import { NavbarService } from 'services/navbar.service';
import { TooltipModule } from 'ngx-bootstrap';
import { MomentModule } from 'angular2-moment';

describe('ClusterListComponent', () => {
  let component: ClusterListComponent;
  let fixture: ComponentFixture<ClusterListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule,
        TranslateModule.forRoot(),
        CommonComponentsModule,
        TooltipModule.forRoot(),
        RouterModule,
        NgxDatatableModule,
        FormsModule,
        PipesModule,
        MomentModule
      ],
      declarations: [
        ClusterListComponent
      ],
      providers: [
        NavbarService,
        BytesSizePipe
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ClusterListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
