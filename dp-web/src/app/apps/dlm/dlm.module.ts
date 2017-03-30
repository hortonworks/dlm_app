import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { routing } from './dlm.routing';
import { HttpModule } from '@angular/http';

import { ClusterService } from './services/cluster.service';
import { PolicyService } from './services/policy.service';
import { JobService } from './services/job.service';
import { MainComponent } from './pages/main/main.component';

@NgModule({
  imports: [
    CommonModule,
    routing,
    HttpModule
  ],
  declarations: [MainComponent],
  providers: [
    ClusterService,
    JobService,
    PolicyService
  ]
})
export class DlmModule { }
