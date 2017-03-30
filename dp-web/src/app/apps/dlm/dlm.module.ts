import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { routing } from './dlm.routing';
import { HttpModule } from '@angular/http';

import { ClusterService } from './services/cluster.service';
import { PolicyService } from './services/policy.service';
import { JobService } from './services/job.service';
import { MainComponent } from './pages/main/main.component';
import { OverviewComponent } from './pages/overview/overview.component';
import { ClustersComponent } from './pages/clusters/clusters.component';
import { PairingsComponent } from './pages/pairings/pairings.component';
import { PoliciesComponent } from './pages/policies/policies.component';
import { JobsComponent } from './pages/jobs/jobs.component';
import { HelpComponent } from './pages/help/help.component';

@NgModule({
  imports: [
    CommonModule,
    routing,
    HttpModule
  ],
  declarations: [
    MainComponent,
    OverviewComponent,
    ClustersComponent,
    PairingsComponent,
    PoliciesComponent,
    JobsComponent,
    HelpComponent
  ],
  providers: [
    ClusterService,
    JobService,
    PolicyService
  ]
})
export class DlmModule { }
