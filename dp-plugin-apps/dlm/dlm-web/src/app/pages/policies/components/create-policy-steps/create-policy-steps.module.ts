/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

import { NgModule } from '@angular/core';
import {StepGeneralComponent} from './step-general/step-general.component';
import {StepSourceComponent} from './step-source/step-source.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {TranslateModule} from '@ngx-translate/core';
import {CommonComponentsModule} from 'components/common-components.module';
import {CommonModule} from '@angular/common';
import {TableComponent} from 'common/table/table.component';
import {CheckboxListComponent} from 'common/checkbox-list/checkbox-list.component';
import {CheckboxColumnComponent} from 'components/table-columns/checkbox-column/checkbox-column.component';
import {HdfsBrowserComponent} from 'components/hdfs-browser/hdfs-browser.component';
import {CheckboxComponent} from 'common/checkbox/checkbox.component';
import {SelectCloudDestinationComponent} from '../select-cloud-destination/select-cloud-destination.component';
import {ActionColumnComponent} from 'components/table-columns/action-column/action-column.component';
import {TableFilterComponent} from 'common/table/table-filter/table-filter.component';
import {RadioButtonComponent} from 'common/radio-button/radio-button.component';
import {TableFooterComponent} from 'common/table/table-footer/table-footer.component';
import {BytesSizePipe} from 'pipes/bytes-size.pipe';
import {PipesModule} from 'pipes/pipes.module';
import {DateFormatPipe, MomentModule} from 'angular2-moment';
import {RouterTestingModule} from '@angular/router/testing';
import {NgxDatatableModule} from '@swimlane/ngx-datatable';
import {MyDatePickerModule} from 'mydatepicker';
import {TimepickerModule, TypeaheadModule} from 'ngx-bootstrap';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    TranslateModule,
    CommonComponentsModule,
    PipesModule,
    MyDatePickerModule,
    MomentModule,
    NgxDatatableModule,
    RouterTestingModule,
    TypeaheadModule,
    TimepickerModule.forRoot()
  ],
  declarations: [
    StepGeneralComponent,
    StepSourceComponent,
    SelectCloudDestinationComponent
  ],
  exports: [
    StepGeneralComponent,
    StepSourceComponent
  ],
  providers: [
    BytesSizePipe,
    DateFormatPipe
  ]
})
export class CreatePolicyStepsModule {
}
