import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpModule, Http } from '@angular/http';
import { BsDropdownModule, CollapseModule, TabsModule, ModalModule, TypeaheadModule } from 'ng2-bootstrap';
import { NgxDatatableModule } from '@swimlane/ngx-datatable';
import { StoreModule } from '@ngrx/store';
import { RouterStoreModule } from '@ngrx/router-store';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { reducer } from './reducers';
import { RouterModule } from '@angular/router';

import { EffectsModule } from '@ngrx/effects';
import { ClusterEffects } from './effects/cluster.effect';
import { routes } from './routes/routes.config';
import { PolicyEffects } from './effects/policy.effect';
import { PairingEffects } from './effects/pairing.effect';
import { JobEffects } from './effects/job.effect';

import { FormEffects } from './effects/form.effect';

import { ClusterService } from './services/cluster.service';
import { PolicyService } from './services/policy.service';
import { PairingService } from './services/pairing.service';
import { JobService } from './services/job.service';
import { SessionStorageService } from './services/session-storage.service';
import { FormService } from 'services/form.service';

import { MainComponent } from './pages/main/main.component';
import { DlmComponent } from './dlm.component';
import { OverviewComponent } from './pages/overview/overview.component';
import { PairingsComponent } from './pages/pairings/pairings.component';
import { CreatePairingComponent } from './pages/pairings/subpages/create-pairing/create-pairing.component';
import { PoliciesComponent } from './pages/policies/policies.component';
import { JobsComponent } from './pages/jobs/jobs.component';
import { HelpComponent } from './pages/help/help.component';
import { NavbarComponent } from './common/navbar/navbar.component';
import { ModalDialogComponent } from './common/modal-dialog/modal-dialog.component';
import { httpServiceProvider } from './services/http.service';
import { CommonComponentsModule } from './components/common-components.module';
import { BreadcrumbComponent } from './components/breadcrumb/breadcrumb.component';
import { NotFoundRouteComponent } from './routes/not-found-route/not-found-route.component';

import { ClustersComponent } from './pages/clusters/clusters.component';
import { ClusterCardComponent } from './pages/clusters/cluster-card/cluster-card.component';
import { ClusterListComponent } from './pages/clusters/cluster-list/cluster-list.component';
import { ClusterSearchComponent } from './pages/clusters/cluster-search/cluster-search.component';

import { JobsTableComponent } from './pages/jobs/jobs-table/jobs-table.component';
import { JobStatusComponent } from './pages/jobs/job-status/job-status.component';
import { JobTransferredGraphComponent } from './pages/jobs/jobs-transferred-graph/job-transferred-graph.component';
import { JobsStatusFilterComponent } from './pages/jobs/jobs-status-filter/jobs-status-filter.component';

import { PolicyTableComponent } from './pages/policies/policy-table/policy-table.component';
import { FlowStatusComponent } from './pages/policies/policy-table/flow-status/flow-status.component';
import { PolicyInfoComponent } from './pages/policies/policy-table/policy-info/policy-info.component';
import { CreatePolicyComponent } from './pages/policies/subpages/create-policy/create-policy.component';
import { PolicyFormComponent } from './pages/policies/components/policy-form/policy-form.component';
import { RadioButtonComponent } from './common/radio-button/radio-button.component';
import { CheckboxComponent } from './common/checkbox/checkbox.component';
import { CheckboxListComponent } from './common/checkbox-list/checkbox-list.component';

import { PairingCardComponent } from './pages/pairings/components/pairing-card/pairing-card.component';
import { PairingCardListComponent } from './pages/pairings/components/pairing-card-list/pairing-card-list.component';
import { CreatePairingCardComponent } from './pages/pairings/components/create-pairing-card/create-pairing-card.component';
import { PairingProgressCardComponent } from './pages/pairings/components/pairing-progress-card/pairing-progress-card.component';
import { CreatePairingCardListComponent } from './pages/pairings/components/create-pairing-card-list/create-pairing-card-list.component';

import { TranslateModule } from '@ngx-translate/core';
import {MomentModule} from 'angular2-moment';
import {ChartsModule} from 'ng2-charts/ng2-charts';

import { TableComponent } from './common/table/table.component';
import { TableFooterComponent } from './common/table/table-footer/table-footer.component';
import { TableFilterComponent } from './common/table/table-filter/table-filter.component';
import { CheckboxColumnComponent, ActionColumnComponent } from './components';
import { ReviewPolicyComponent } from 'pages/policies/subpages/review-policy/review-policy.component';

import {BytesSizePipe} from './pipes/bytes-size.pipe';

@NgModule({
  imports: [
    MomentModule,
    ChartsModule,
    CommonModule,
    HttpModule,
    NgxDatatableModule,
    StoreModule.provideStore(reducer),
    RouterStoreModule.connectRouter(),
    EffectsModule.run(ClusterEffects),
    EffectsModule.run(PolicyEffects),
    EffectsModule.run(PairingEffects),
    EffectsModule.run(JobEffects),
    EffectsModule.run(FormEffects),
    CollapseModule.forRoot(),
    TabsModule.forRoot(),
    ModalModule.forRoot(),
    TypeaheadModule.forRoot(),
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,

    RouterModule.forRoot(routes),
    CommonComponentsModule,
    TranslateModule.forRoot()
  ],
  declarations: [
    DlmComponent,
    MainComponent,
    OverviewComponent,
    ClustersComponent,
    ClusterCardComponent,
    ClusterListComponent,
    ClusterSearchComponent,
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

    JobsTableComponent,
    JobStatusComponent,
    JobTransferredGraphComponent,
    JobsStatusFilterComponent,

    JobsComponent,
    HelpComponent,
    NavbarComponent,
    NotFoundRouteComponent,
    RadioButtonComponent,
    CheckboxComponent,
    CheckboxListComponent,
    CreatePairingCardComponent,
    CreatePairingCardListComponent,
    PairingProgressCardComponent,
    PairingCardComponent,
    PairingCardListComponent,
    TableComponent,
    TableFooterComponent,
    TableFilterComponent,
    CheckboxColumnComponent,
    ActionColumnComponent,
    ModalDialogComponent,
    BytesSizePipe
  ],
  bootstrap: [DlmComponent],
  providers: [
    ClusterService,
    JobService,
    PolicyService,
    PairingService,
    SessionStorageService,
    FormService,
    httpServiceProvider
  ]
})
export class DlmModule { }
