/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BsDropdownModule, ButtonsModule, TooltipModule, CollapseModule, ProgressbarModule, AlertModule } from 'ng2-bootstrap';
import { ModalModule } from 'ng2-bootstrap';
import { ChartsModule } from 'ng2-charts/ng2-charts';
import { TranslateModule } from '@ngx-translate/core';
import { SelectModule } from 'ng2-select';
import { MomentModule } from 'angular2-moment';
import { SimpleNotificationsModule } from 'angular2-notifications';

import { PipesModule } from 'pipes/pipes.module';
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
import { PolicyActionsComponent } from './policy-actions/policy-actions.component';
import { HiveBrowserComponent, HiveDatabaseComponent } from './hive-browser/';
import { DurationColumnComponent } from './table-columns/duration-column/duration-column.component';
import { TransferredColumnComponent } from './table-columns/transferred-column/transferred-column.component';
import { JobStatusComponent } from './job-status/job-status.component';
import { MapLegendComponent } from './map/map-legend/map-legend.component';
import { MapLegendContainerComponent } from './map/map-legend-container/map-legend-container.component';
import { ClusterStatusIconComponent } from './cluster-status-icon/cluster-status-icon.component';
import { BeaconValidityComponent } from './messages/beacon-validity/beacon-validity.component';
import { HelpLinkComponent } from './help-link/help-link.component';
import { ClusterActionsComponent } from './cluster-actions/cluster-actions.component';
import { HortonStyleModule } from 'common/horton-style.module';
import { ConfirmationModalContainerComponent } from './confirmation-modal/confirmation-modal-container.component';
import { EventEntityLinkComponent } from './event-entity-link/event-entity-link.component';
import { NotificationsContainerComponent } from './notifications-container/notifications-container.component';
import { TransferredObjectsComponent } from './table-columns/transferred-objects/transferred-objects.component';

@NgModule({
  imports: [
    CommonModule,
    BsDropdownModule.forRoot(),
    ButtonsModule.forRoot(),
    TooltipModule.forRoot(),
    CollapseModule.forRoot(),
    ProgressbarModule.forRoot(),
    AlertModule.forRoot(),
    ModalModule.forRoot(),
    SimpleNotificationsModule.forRoot(),
    ChartsModule,
    TranslateModule,
    HortonStyleModule,
    SelectModule,
    MomentModule,
    PipesModule
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
    HiveDatabaseComponent,
    PolicyActionsComponent,
    ClusterActionsComponent,
    DurationColumnComponent,
    TransferredColumnComponent,
    JobStatusComponent,
    MapLegendComponent,
    MapLegendContainerComponent,
    ClusterStatusIconComponent,
    BeaconValidityComponent,
    HelpLinkComponent,
    ConfirmationModalContainerComponent,
    EventEntityLinkComponent,
    NotificationsContainerComponent,
    TransferredObjectsComponent
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
    HiveDatabaseComponent,
    PolicyActionsComponent,
    ClusterActionsComponent,
    DurationColumnComponent,
    TransferredColumnComponent,
    JobStatusComponent,
    MapLegendComponent,
    MapLegendContainerComponent,
    ClusterStatusIconComponent,
    BeaconValidityComponent,
    HelpLinkComponent,
    ConfirmationModalContainerComponent,
    EventEntityLinkComponent,
    NotificationsContainerComponent,
    TransferredObjectsComponent
  ]
})
export class CommonComponentsModule {}
