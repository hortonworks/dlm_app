/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

import { NgModule, APP_INITIALIZER } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import {
  CollapseModule,
  TabsModule,
  ModalModule,
  TypeaheadModule,
  TimepickerModule,
  TooltipModule,
  BsDropdownModule,
  ProgressbarModule
} from 'ngx-bootstrap';
import { SelectModule } from 'ng2-select';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { StoreModule } from '@ngrx/store';
import { StoreRouterConnectingModule } from '@ngrx/router-store';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { metaReducers, reducers } from './reducers';
import { RouterModule } from '@angular/router';

import { MyDatePickerModule } from 'mydatepicker';
import { ClipboardModule } from 'ngx-clipboard';

import { AppConfig, appConfigFactory } from './app.config';
import { AuthInterceptor } from './interceptors/auth.interceptor';
import { MockResponseInterceptor } from './interceptors/mock-response.interceptor';
import { ApiInterceptor } from './interceptors/api.interceptor';

import { EffectsModule } from '@ngrx/effects';
import { ClusterEffects } from './effects/cluster.effect';
import { routes } from './routes/routes.config';
import { PolicyEffects } from './effects/policy.effect';
import { PairingEffects } from './effects/pairing.effect';
import { JobEffects } from './effects/job.effect';
import { EventEffects } from './effects/event.effect';
import { HdfsListEffects } from './effects/hdfslist.effect';
import { HiveListEffects } from './effects/hivelist.effect';
import { LogEffects } from './effects/log.effect';
import { ConfirmationEffects } from './effects/confirmation.effect';
import { NotificationEffects } from './effects/notification.effect';
import { BeaconEffects } from './effects/beacon.effect';
import { YarnEffects } from './effects/yarn.effect';
import { CloudAccountsEffects } from './effects/cloud-accounts.effect';
import { CloudContainersEffects } from './effects/cloud-containers.effect';
import { BeaconCloudCredEffects } from './effects/beacon-cloud-creds.effect';

import { FormEffects } from './effects/form.effect';
import { RouterEffects } from './effects/router.effect';

import { ClusterService } from './services/cluster.service';
import { PolicyService } from './services/policy.service';
import { PairingService } from './services/pairing.service';
import { JobService } from './services/job.service';
import { SessionStorageService } from './services/session-storage.service';
import { FormService } from 'services/form.service';
import { NavbarService } from 'services/navbar.service';
import { EventService } from 'services/event.service';
import { LogService } from 'services/log.service';
import { TimeZoneService } from 'services/time-zone.service';
import { HdfsService } from 'services/hdfs.service';
import { HiveService } from 'services/hive.service';
import { NotificationService } from 'services/notification.service';
import { OverviewJobsExternalFiltersService } from 'services/overview-jobs-external-filters.service';
import { UserService } from 'services/user.service';
import { ConfirmationService } from 'services/confirmation.service';
import { BeaconService } from 'services/beacon.service';
import { YarnService } from 'services/yarn.service';
import { CloudAccountService } from 'services/cloud-account.service';
import { CloudContainerService } from 'services/cloud-container.service';

import { MainComponent } from './pages/main/main.component';
import { DlmComponent } from './dlm.component';
import { OverviewComponent } from './pages/overview/overview.component';
import { PairingsComponent } from './pages/pairings/pairings.component';
import { CreatePairingComponent } from './pages/pairings/subpages/create-pairing/create-pairing.component';
import { PoliciesComponent } from './pages/policies/policies.component';
import { JobsComponent } from './pages/jobs/jobs.component';
import { HelpComponent } from './pages/help/help.component';
import { NavbarComponent } from './common/navbar/navbar.component';
import { NavigationDropdownComponent } from './common/navigation-dropdown/navigation-dropdown.component';
import { NotificationsComponent } from './common/notifications/notifications.component';
import { EventMessageComponent } from './common/notifications/event-message/event-message.component';
import { NotificationsPageComponent } from './pages/notifications/notifications.component';
import { NotificationsTableComponent } from './pages/notifications/notifications-table/notifications-table.component';
import { ModalDialogComponent } from './common/modal-dialog/modal-dialog.component';
import { ModalDialogBodyComponent } from './common/modal-dialog/modal-dialog-body.component';
import { CommonComponentsModule } from './components/common-components.module';
import { UserDropdownComponent } from './common/user-dropdown/user-dropdown.component';
import { BreadcrumbComponent } from './components/breadcrumb/breadcrumb.component';
import { NotFoundRouteComponent } from './routes/not-found-route/not-found-route.component';
import { HdfsBrowserComponent } from './components/hdfs-browser/hdfs-browser.component';
import { PersonaPopupComponent } from 'common/persona-popup/persona-popup.component';

import { OverviewModule } from './pages/overview/overview.module';
import { OverviewFilterComponent } from './pages/overview/overview-filter/overview-filter.component';
import { IssuesListComponent } from './pages/overview/issues-list/issues-list.component';
import { IssuesListItemComponent } from './pages/overview/issues-list-item/issues-list-item.component';
import { JobsOverviewTableComponent } from './pages/overview/jobs-overview-table/jobs-overview-table.component';

import { ClustersComponent } from './pages/clusters/clusters.component';
import { CloudAccountsComponent } from './pages/cloud-accounts/cloud-accounts.component';
import { CloudAccountsListComponent } from './pages/cloud-accounts/components/cloud-accounts-list/cloud-accounts-list.component';
import { AddAccountModalComponent } from 'pages/cloud-accounts/components/add-account-modal/add-account-modal.component';
import { ClusterListComponent } from './pages/clusters/cluster-list/cluster-list.component';
import { CloudContainerBrowserComponent } from 'components/cloud-container-browser/cloud-container-browser.component';
import { CloudAccountActionsComponent } from './pages/cloud-accounts/components/cloud-account-actions/cloud-account-actions.component';
// tslint:disable-next-line
import { CloudAccountsPoliciesTableComponent } from './pages/cloud-accounts/components/cloud-account-policies-table/cloud-account-policies-table.component';
// tslint:disable-next-line
import { CloudContainerBrowserBreadcrumbComponent } from 'components/cloud-container-browser/breadcrumb/cloud-container-browser-breadcrumb.component';

import { JobsTableComponent } from './pages/jobs/jobs-table/jobs-table.component';
import { JobsStatusFilterComponent } from './pages/jobs/jobs-status-filter/jobs-status-filter.component';

import { PolicyTableComponent } from './pages/policies/policy-table/policy-table.component';
import { FlowStatusComponent } from './pages/policies/policy-table/flow-status/flow-status.component';
import { PolicyInfoComponent } from './pages/policies/policy-table/policy-info/policy-info.component';
import { CreatePolicyComponent } from './pages/policies/subpages/create-policy/create-policy.component';
import { PolicyFormComponent } from './pages/policies/components/policy-form/policy-form.component';
import { PolicyServiceFilterComponent } from './pages/policies/components/policy-service-filter/policy-service-filter.component';

import { PolicyDetailsComponent } from './pages/policies/policy-details/policy-details.component';
import { PrevJobsComponent } from './pages/policies/components/prev-jobs/prev-jobs.component';
import { SelectCloudDestinationComponent } from './pages/policies/components/select-cloud-destination/select-cloud-destination.component';

import { PairingCardComponent } from './pages/pairings/components/pairing-card/pairing-card.component';
import { PairingCardListComponent } from './pages/pairings/components/pairing-card-list/pairing-card-list.component';
import { CreatePairingCardComponent } from './pages/pairings/components/create-pairing-card/create-pairing-card.component';
import { PairingProgressCardComponent } from './pages/pairings/components/pairing-progress-card/pairing-progress-card.component';
import { CreatePairingCardListComponent } from './pages/pairings/components/create-pairing-card-list/create-pairing-card-list.component';

import { LogModalDialogComponent } from 'components/log-modal-dialog/log-modal-dialog.component';

import { TranslateModule } from '@ngx-translate/core';
import { MomentModule } from 'angular2-moment';

import { ReviewPolicyComponent } from 'pages/policies/subpages/review-policy/review-policy.component';

import { TabsComponent } from './common/tabs/tabs.component';

import { PipesModule } from './pipes/pipes.module';
import { FrequencyPipe } from 'pipes/frequency.pipe';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { SimpleNotificationsModule } from 'angular2-notifications';

import { HortonStyleModule } from 'common/horton-style.module';
import { BytesSizePipe } from 'pipes/bytes-size.pipe';
import { AsyncActionsService } from 'services/async-actions.service';

import { AddCloudFormComponent } from './pages/cloud-accounts/components/add-cloud-form/add-cloud-form.component';
import { CreatePolicyModalComponent } from 'pages/policies/components/create-policy-modal/create-policy-modal.component';
import { CreatePolicyWizardComponent } from 'pages/policies/components/create-policy-wizard/create-policy-wizard.component';
import { WizardContentComponent } from 'pages/policies/components/wizard-content/wizard-content.component';
import { CreatePolicyStepsModule } from './pages/policies/components/create-policy-steps/create-policy-steps.module';
import { WizardSummaryComponent } from './pages/policies/components/create-policy-wizard-summary/create-policy-wizard-summary.component';
import { SummaryTreeComponent } from './pages/policies/components/summary-tree/summary-tree.component';

@NgModule({
  imports: [
    MomentModule,
    CommonModule,
    HttpClientModule,
    NgxDatatableModule,
    StoreModule.forRoot(reducers, {
      initialState: {},
      metaReducers
    }),
    StoreRouterConnectingModule,
    EffectsModule.forRoot([
      ClusterEffects,
      PolicyEffects,
      PairingEffects,
      JobEffects,
      FormEffects,
      EventEffects,
      HdfsListEffects,
      HiveListEffects,
      LogEffects,
      ConfirmationEffects,
      NotificationEffects,
      BeaconEffects,
      RouterEffects,
      YarnEffects,
      CloudAccountsEffects,
      CloudContainersEffects,
      BeaconCloudCredEffects
    ]),
    CollapseModule.forRoot(),
    BsDropdownModule.forRoot(),
    TabsModule.forRoot(),
    ModalModule.forRoot(),
    TypeaheadModule.forRoot(),
    TimepickerModule.forRoot(),
    TooltipModule.forRoot(),
    ProgressbarModule.forRoot(),
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    SelectModule,
    MyDatePickerModule,
    ClipboardModule,

    RouterModule.forRoot(routes),
    CommonComponentsModule,
    HortonStyleModule,
    TranslateModule.forRoot(),
    BrowserAnimationsModule,
    SimpleNotificationsModule.forRoot(),
    PipesModule,
    OverviewModule,
    CreatePolicyStepsModule
  ],
  declarations: [
    DlmComponent,
    MainComponent,
    OverviewComponent,
    NotificationsPageComponent,
    NotificationsTableComponent,
    ClustersComponent,
    ClusterListComponent,
    CloudAccountsComponent,
    CloudAccountsListComponent,
    CloudContainerBrowserComponent,
    CloudAccountActionsComponent,
    CloudAccountsPoliciesTableComponent,
    CloudContainerBrowserBreadcrumbComponent,
    AddAccountModalComponent,
    PairingsComponent,
    CreatePairingComponent,
    BreadcrumbComponent,

    PoliciesComponent,
    PolicyTableComponent,
    FlowStatusComponent,
    PolicyInfoComponent,
    CreatePolicyComponent,
    PolicyFormComponent,
    ReviewPolicyComponent,
    PolicyDetailsComponent,
    PolicyServiceFilterComponent,
    PrevJobsComponent,

    OverviewFilterComponent,
    IssuesListComponent,
    IssuesListItemComponent,
    JobsOverviewTableComponent,

    JobsTableComponent,
    JobsStatusFilterComponent,

    JobsComponent,
    HelpComponent,
    NavbarComponent,
    NavigationDropdownComponent,
    UserDropdownComponent,
    NotFoundRouteComponent,
    CreatePairingCardComponent,
    CreatePairingCardListComponent,
    PairingProgressCardComponent,
    PairingCardComponent,
    PairingCardListComponent,
    NotificationsComponent,
    EventMessageComponent,
    LogModalDialogComponent,
    PersonaPopupComponent,
    TabsComponent,
    AddCloudFormComponent,
    CreatePolicyModalComponent,
    CreatePolicyWizardComponent,
    WizardContentComponent,
    WizardSummaryComponent,
    SummaryTreeComponent
  ],
  bootstrap: [DlmComponent],
  providers: [
    ClusterService,
    JobService,
    PolicyService,
    PairingService,
    SessionStorageService,
    FormService,
    NavbarService,
    EventService,
    LogService,
    BytesSizePipe,
    TimeZoneService,
    HdfsService,
    HiveService,
    NotificationService,
    OverviewJobsExternalFiltersService,
    ConfirmationService,
    FrequencyPipe,
    UserService,
    BeaconService,
    YarnService,
    AsyncActionsService,
    CloudAccountService,
    CloudContainerService,
    AppConfig,
    {
      provide: APP_INITIALIZER,
      useFactory: appConfigFactory,
      deps: [AppConfig, UserService],
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ApiInterceptor,
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: MockResponseInterceptor,
      multi: true
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    }
  ]
})
export class DlmModule {
}
