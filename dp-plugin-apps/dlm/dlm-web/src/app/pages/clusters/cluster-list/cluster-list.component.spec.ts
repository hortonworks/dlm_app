/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
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
