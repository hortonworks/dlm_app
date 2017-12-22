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
import { MyDatePickerModule } from 'mydatepicker';
import {CollapseModule, TabsModule, TypeaheadModule, TimepickerModule} from 'ngx-bootstrap';

import {RadioButtonComponent} from 'common/radio-button/radio-button.component';
import {CheckboxListComponent} from 'common/checkbox-list/checkbox-list.component';
import {CheckboxComponent} from 'common/checkbox/checkbox.component';
import { CommonComponentsModule } from 'components/common-components.module';
import {PolicyFormComponent} from '../../components/policy-form/policy-form.component';
import {CreatePolicyComponent} from './create-policy.component';
import {HdfsBrowserComponent} from 'components/hdfs-browser/hdfs-browser.component';
import {TableComponent} from 'common/table/table.component';
import {MomentModule} from 'angular2-moment';
import {TableFooterComponent} from 'common/table/table-footer/table-footer.component';
import {NgxDatatableModule} from '@swimlane/ngx-datatable';
import {TableFilterComponent} from 'common/table/table-filter/table-filter.component';
import {ActionColumnComponent} from 'components/table-columns/action-column/action-column.component';
import {NavbarService} from 'services/navbar.service';
import {CheckboxColumnComponent} from 'components/table-columns/checkbox-column/checkbox-column.component';
import { RouterTestingModule } from '@angular/router/testing';
import {PipesModule} from 'pipes/pipes.module';
import {TooltipModule} from 'ngx-bootstrap';
import { configureComponentTest } from 'testing/configure';

describe('CreatePolicyComponent', () => {
  let component: CreatePolicyComponent;
  let fixture: ComponentFixture<CreatePolicyComponent>;

  beforeEach(async(() => {
    configureComponentTest({
      imports: [
        TooltipModule.forRoot(),
        CommonComponentsModule,
        TimepickerModule.forRoot(),
        ReactiveFormsModule,
        FormsModule,
        CollapseModule,
        TabsModule.forRoot(),
        MyDatePickerModule,
        MomentModule,
        NgxDatatableModule,
        RouterTestingModule,
        TypeaheadModule,
        PipesModule
      ],
      declarations: [
        CreatePolicyComponent,
        PolicyFormComponent,
        RadioButtonComponent,
        CheckboxListComponent,
        CheckboxComponent,
        HdfsBrowserComponent,
        TableComponent,
        TableFooterComponent,
        TableFilterComponent,
        ActionColumnComponent,
        CheckboxColumnComponent
      ],
      providers: [
        NavbarService
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreatePolicyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
