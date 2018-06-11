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
import {ClustersComponent} from './clusters.component';
import {ClusterListComponent} from './cluster-list/cluster-list.component';
import {TranslateLoader, TranslateModule} from '@ngx-translate/core';
import {MockTranslateLoader} from 'mocks/mock-translate-loader';
import {HortonStyleModule} from 'common/horton-style.module';
import {configureComponentTest} from 'testing/configure';
import {RouterTestingModule} from '@angular/router/testing';
import {TooltipModule} from 'ngx-bootstrap';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {ClusterLegendComponent} from '../overview/cluster-legend/cluster-legend.component';
import {TableComponent} from 'common/table/table.component';
import {HdfsBrowserComponent} from 'components/hdfs-browser/hdfs-browser.component';
import {NgxDatatableModule} from '@swimlane/ngx-datatable';
import {TableFooterComponent} from 'common/table/table-footer/table-footer.component';
import {CheckboxColumnComponent} from 'components/table-columns';
import {CheckboxComponent} from 'common/checkbox/checkbox.component';
import {ActionColumnComponent} from 'components/table-columns/action-column';
import {PipesModule} from 'pipes/pipes.module';
import {BytesSizePipe} from 'pipes/bytes-size.pipe';
import {NavbarService} from 'services/navbar.service';
import {MomentModule} from 'angular2-moment';
import { ClusterService } from 'services/cluster.service';
import { AsyncActionsService } from 'services/async-actions.service';

describe('ClustersComponent', () => {
  let component: ClustersComponent;
  let fixture: ComponentFixture<ClustersComponent>;

  beforeEach(async(() => {
    configureComponentTest({
      imports: [
        RouterTestingModule,
        TranslateModule.forRoot({
          loader: {provide: TranslateLoader, useClass: MockTranslateLoader}
        }),
        CommonComponentsModule,
        TooltipModule.forRoot(),
        FormsModule,
        ReactiveFormsModule,
        NgxDatatableModule,
        HortonStyleModule,
        PipesModule,
        MomentModule
      ],
      declarations: [
        ClustersComponent,
        ClusterListComponent,
        ClusterLegendComponent
      ],
      providers: [
        BytesSizePipe,
        NavbarService,
        ClusterService,
        AsyncActionsService
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ClustersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
