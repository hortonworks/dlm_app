/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

import {async, ComponentFixture, TestBed} from '@angular/core/testing';
import {ReactiveFormsModule, FormsModule} from '@angular/forms';
import {Store} from '@ngrx/store';
import {TranslateLoader, TranslateModule} from '@ngx-translate/core';
import {CollapseModule, TabsModule, TypeaheadModule, TimepickerModule} from 'ng2-bootstrap';
import { MyDatePickerModule } from 'mydatepicker';

import { CommonComponentsModule } from 'components/common-components.module';
import {MockTranslateLoader} from 'mocks/mock-translate-loader';
import {RadioButtonComponent} from 'common/radio-button/radio-button.component';
import {CheckboxListComponent} from 'common/checkbox-list/checkbox-list.component';
import {CheckboxComponent} from 'common/checkbox/checkbox.component';
import {MockStore} from 'mocks/mock-store';
import {CheckboxColumnComponent} from 'components/table-columns/checkbox-column/checkbox-column.component';
import {PolicyFormComponent} from './policy-form.component';
import {HdfsBrowserComponent} from 'components/hdfs-browser/hdfs-browser.component';
import {TableComponent} from 'common/table/table.component';
import {TableFooterComponent} from 'common/table/table-footer/table-footer.component';
import {TableFilterComponent} from 'common/table/table-filter/table-filter.component';
import {ActionColumnComponent} from 'components/table-columns/action-column/action-column.component';
import {MomentModule} from 'angular2-moment';
import {NgxDatatableModule} from '@swimlane/ngx-datatable';
import {NavbarService} from 'services/navbar.service';
import {MockTimeZoneService} from 'mocks/mock-timezone';
import {TimeZoneService} from 'services/time-zone.service';
import { PipesModule } from 'pipes/pipes.module';
import { HdfsService } from 'services/hdfs.service';
import { Observable } from 'rxjs/Observable';

describe('PolicyFormComponent', () => {
  let component: PolicyFormComponent;
  let fixture: ComponentFixture<PolicyFormComponent>;

  beforeEach(async(() => {
    const mockHdfsService = {
      getFilesList() {return Observable.of([]); }
    };
    TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot({
          loader: {provide: TranslateLoader, useClass: MockTranslateLoader}
        }),
        TimepickerModule.forRoot(),
        ReactiveFormsModule, FormsModule, CollapseModule, TabsModule.forRoot(), MyDatePickerModule,
        CommonComponentsModule,
        MomentModule,
        NgxDatatableModule,
        TypeaheadModule,
        PipesModule
      ],
      declarations: [
        PolicyFormComponent,
        RadioButtonComponent,
        CheckboxComponent,
        CheckboxListComponent,
        CheckboxColumnComponent,
        HdfsBrowserComponent,
        TableComponent,
        TableFooterComponent,
        TableFilterComponent,
        ActionColumnComponent
      ],
      providers: [
        {provide: Store, useClass: MockStore},
        {provide: TimeZoneService, useClass: MockTimeZoneService},
        {provide: HdfsService, useValue: mockHdfsService},
        NavbarService
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PolicyFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
