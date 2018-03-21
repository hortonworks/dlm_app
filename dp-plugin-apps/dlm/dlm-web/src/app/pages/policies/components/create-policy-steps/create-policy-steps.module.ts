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
import {StepScheduleComponent} from './step-schedule/step-schedule.component';
import {StepDestinationComponent} from './step-destination/step-destination.component';
import {StepSourceComponent} from './step-source/step-source.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {TranslateModule} from '@ngx-translate/core';
import {CommonComponentsModule} from 'components/common-components.module';
import {CommonModule} from '@angular/common';
import {BytesSizePipe} from 'pipes/bytes-size.pipe';
import {PipesModule} from 'pipes/pipes.module';
import {DateFormatPipe, MomentModule} from 'angular2-moment';
import {RouterTestingModule} from '@angular/router/testing';
import {NgxDatatableModule} from '@swimlane/ngx-datatable';
import {MyDatePickerModule} from 'mydatepicker';
import {TimepickerModule, TypeaheadModule, TooltipModule} from 'ngx-bootstrap';
import {StepAdvancedComponent} from './step-advanced/step-advanced.component';

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
    TooltipModule.forRoot(),
    TimepickerModule.forRoot()
  ],
  declarations: [
    StepGeneralComponent,
    StepSourceComponent,
    StepDestinationComponent,
    StepScheduleComponent,
    StepAdvancedComponent
  ],
  exports: [
    StepGeneralComponent,
    StepScheduleComponent,
    StepDestinationComponent,
    StepSourceComponent,
    StepAdvancedComponent
  ],
  providers: [
    BytesSizePipe,
    DateFormatPipe
  ]
})
export class CreatePolicyStepsModule {
}
