import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BsDropdownModule, ButtonsModule, TooltipModule, CollapseModule } from 'ng2-bootstrap';
import { ChartsModule } from 'ng2-charts/ng2-charts';
import { TranslateModule } from '@ngx-translate/core';
import { SelectModule } from 'ng2-select';

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
import { SelectFieldComponent, SelectFieldOptionDirective, SelectFieldValueDirective } from './forms/select-field/';
import { MapComponent } from './map/map.component';
import { PageHeaderComponent } from './page-header/page-header.component';
import { AddEntityButtonComponent } from './add-entity-button/add-entity-button.component';
import { EventStatusComponent } from './event-status/event-status.component';
import { HdfsBrowserBreadcrumbComponent } from './hdfs-browser/breadcrumb/hdfs-browser-breadcrumb.component';
import { HiveBrowserComponent, HiveDatabaseComponent } from './hive-browser/';

@NgModule({
  imports: [
    CommonModule,
    BsDropdownModule.forRoot(),
    ButtonsModule.forRoot(),
    TooltipModule.forRoot(),
    CollapseModule.forRoot(),
    ChartsModule,
    TranslateModule,
    SelectModule
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
    SelectFieldComponent,
    SelectFieldOptionDirective,
    SelectFieldValueDirective,
    MapComponent,
    PageHeaderComponent,
    AddEntityButtonComponent,
    EventStatusComponent,
    HdfsBrowserBreadcrumbComponent,
    HiveBrowserComponent,
    HiveDatabaseComponent
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
    SelectFieldComponent,
    SelectFieldOptionDirective,
    SelectFieldValueDirective,
    MapComponent,
    PageHeaderComponent,
    AddEntityButtonComponent,
    EventStatusComponent,
    HdfsBrowserBreadcrumbComponent,
    HiveBrowserComponent,
    HiveDatabaseComponent
  ]
})
export class CommonComponentsModule {}
