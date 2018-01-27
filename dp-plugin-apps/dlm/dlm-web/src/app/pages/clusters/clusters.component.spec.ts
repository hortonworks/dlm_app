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
        ClusterLegendComponent,
        ActionColumnComponent,
        TableComponent,
        CheckboxColumnComponent,
        CheckboxComponent,
        TableFooterComponent,
        HdfsBrowserComponent
      ],
      providers: [
        BytesSizePipe,
        NavbarService
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
