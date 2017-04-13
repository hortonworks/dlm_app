import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpModule, Http } from '@angular/http';
import { BsDropdownModule } from 'ng2-bootstrap';
import { StoreModule } from '@ngrx/store';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { reducer } from './reducers';
import { RouterModule } from '@angular/router';

import { EffectsModule } from '@ngrx/effects';
import { ClusterEffects } from './effects/cluster';
import { routes } from './routes/routes.config';
import { ClusterService } from './services/cluster.service';
import { PolicyService } from './services/policy.service';
import { JobService } from './services/job.service';
import { MainComponent } from './pages/main/main.component';
import { DlmComponent } from './dlm.component';
import { OverviewComponent } from './pages/overview/overview.component';
import { PairingsComponent } from './pages/pairings/pairings.component';
import { PoliciesComponent } from './pages/policies/policies.component';
import { JobsComponent } from './pages/jobs/jobs.component';
import { HelpComponent } from './pages/help/help.component';
import { NavbarComponent } from './common/navbar/navbar.component';

import { httpServiceProvider } from './services/http.service';
import { CommonComponentsModule } from './components/common-components.module';
import { NotFoundRouteComponent } from './routes/not-found-route/not-found-route.component';
import { ClustersModule } from './pages/clusters/clusters.module';

@NgModule({
  imports: [
    CommonModule,
    HttpModule,
    StoreModule.provideStore(reducer),
    EffectsModule.run(ClusterEffects),

    BrowserModule,
    FormsModule,

    RouterModule.forRoot(routes),
    CommonComponentsModule,
    ClustersModule
  ],
  declarations: [
    DlmComponent,
    MainComponent,
    OverviewComponent,
    PairingsComponent,
    PoliciesComponent,
    JobsComponent,
    HelpComponent,
    NavbarComponent,
    NotFoundRouteComponent
  ],
  bootstrap: [DlmComponent],
  providers: [
    ClusterService,
    JobService,
    PolicyService,
    httpServiceProvider
  ]
})
export class DlmModule { }
