import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BsDropdownModule, ButtonsModule } from 'ng2-bootstrap';
import { ChartsModule } from 'ng2-charts/ng2-charts';
import { TranslateModule } from '@ngx-translate/core';

import { CardComponent } from './card/card.component';
import { SearchInputComponent } from './search-input/search-input.component';
import { DropdownComponent } from './dropdown/dropdown.component';
import { ClusterCardComponent } from './cluster-card/cluster-card.component';
import { StatusColumnComponent } from './table-columns/status-column/status-column.component';
import { IconColumnComponent } from './table-columns/icon-column/icon-column.component';
import { DoughnutChartComponent } from './doughnut-chart/doughnut-chart.component';
import { FormFieldComponent } from './forms/form-field/form-field.component';
import { FormFieldDirective } from './forms/form-field/form-field.directive';
import { FieldErrorComponent } from './forms/field-error/field-error.component';
import { ProgressContainerComponent } from './progress-container/progress-container.component';
import { MapComponent } from './map/map.component';

@NgModule({
  imports: [
    CommonModule,
    BsDropdownModule.forRoot(),
    ButtonsModule.forRoot(),
    ChartsModule,
    TranslateModule
  ],
  declarations: [
    CardComponent,
    SearchInputComponent,
    DropdownComponent,
    ClusterCardComponent,
    StatusColumnComponent,
    IconColumnComponent,
    DoughnutChartComponent,
    FormFieldComponent,
    FormFieldDirective,
    FieldErrorComponent,
    ProgressContainerComponent,
    MapComponent
  ],
  exports: [
    CardComponent,
    SearchInputComponent,
    DropdownComponent,
    ClusterCardComponent,
    StatusColumnComponent,
    IconColumnComponent,
    DoughnutChartComponent,
    FormFieldComponent,
    FormFieldDirective,
    FieldErrorComponent,
    ProgressContainerComponent,
    MapComponent
  ]
})
export class CommonComponentsModule {}
