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

import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  BsDropdownModule,
  ButtonsModule,
  TooltipModule,
  CollapseModule,
  ProgressbarModule,
  AlertModule,
  TypeaheadModule
} from 'ngx-bootstrap';
import { ModalModule } from 'ngx-bootstrap';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
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
import { StatusColumnComponent } from './table-columns/policy-status-column/policy-status-column.component';
import { IconColumnComponent } from './table-columns/icon-column/icon-column.component';
import { FormFieldComponent } from './forms/form-field/form-field.component';
import { FormFieldDirective } from './forms/form-field/form-field.directive';
import { FieldErrorComponent } from './forms/field-error/field-error.component';
import { ProgressContainerComponent } from './progress-container/progress-container.component';
import {
  SelectFieldComponent,
  SelectFieldOptionDirective,
  SelectFieldValueDirective,
  SelectFieldDropdownDirective
} from './forms/select-field/';
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
import { ServiceStatusIconComponent } from './service-status-icon/service-status-icon.component';
import { FieldLabelComponent } from './forms/field-label/field-label.component';
import {TableComponent} from '../common/table/table.component';
import {CheckboxListComponent} from '../common/checkbox-list/checkbox-list.component';
import {CheckboxColumnComponent} from './table-columns/checkbox-column/checkbox-column.component';
import {HdfsBrowserComponent} from './hdfs-browser/hdfs-browser.component';
import {CheckboxComponent} from '../common/checkbox/checkbox.component';
import {ActionColumnComponent} from './table-columns/action-column/action-column.component';
import {TableFilterComponent} from '../common/table/table-filter/table-filter.component';
import {RadioButtonComponent} from '../common/radio-button/radio-button.component';
import {TableFooterComponent} from '../common/table/table-footer/table-footer.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

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
    NgxDatatableModule,
    TypeaheadModule,
    ChartsModule,
    TranslateModule,
    HortonStyleModule,
    SelectModule,
    MomentModule,
    PipesModule,
    FormsModule,
    ReactiveFormsModule
  ],
  declarations: [
    CardComponent,
    SearchInputComponent,
    DropdownComponent,
    ClusterCardComponent,
    StatusColumnComponent,
    IconColumnComponent,
    FormFieldComponent,
    FormFieldDirective,
    FieldErrorComponent,
    ProgressContainerComponent,
    SelectFieldComponent,
    SelectFieldOptionDirective,
    SelectFieldValueDirective,
    SelectFieldDropdownDirective,
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
    TransferredObjectsComponent,
    ServiceStatusIconComponent,
    FieldLabelComponent,
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
  exports: [
    CardComponent,
    SearchInputComponent,
    DropdownComponent,
    ClusterCardComponent,
    StatusColumnComponent,
    IconColumnComponent,
    FormFieldComponent,
    FormFieldDirective,
    FieldErrorComponent,
    ProgressContainerComponent,
    SelectFieldComponent,
    SelectFieldOptionDirective,
    SelectFieldValueDirective,
    SelectFieldDropdownDirective,
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
    TransferredObjectsComponent,
    ServiceStatusIconComponent,
    FieldLabelComponent,
    RadioButtonComponent,
    CheckboxListComponent,
    CheckboxComponent,
    HdfsBrowserComponent,
    TableComponent,
    TableFooterComponent,
    TableFilterComponent,
    ActionColumnComponent,
    CheckboxColumnComponent
  ]
})
export class CommonComponentsModule {
}
