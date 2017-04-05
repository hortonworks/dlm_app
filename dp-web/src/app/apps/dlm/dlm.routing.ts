import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DlmComponent } from './dlm.component';
import { OverviewComponent } from './pages/overview/overview.component';
import { ClustersComponent } from './pages/clusters/clusters.component';
import { PairingsComponent } from './pages/pairings/pairings.component';
import { PoliciesComponent } from './pages/policies/policies.component';
import { JobsComponent } from './pages/jobs/jobs.component';
import { HelpComponent } from './pages/help/help.component';

const dlmRoutes: Routes = [
  {
    path: '',
    component: DlmComponent,
    children: [
      {
        path: '',
        redirectTo: '/dlm/overview',
        pathMatch: 'full'
      },
      {
        path: 'overview',
        component: OverviewComponent
      },
      {
        path: 'clusters',
        component: ClustersComponent
      },
      {
        path: 'pairings',
        component: PairingsComponent
      },
      {
        path: 'policies',
        component: PoliciesComponent
      },
      {
        path: 'jobs',
        component: JobsComponent
      },
      {
        path: 'help',
        component: HelpComponent
      },
    ]
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(dlmRoutes)
  ],
  exports: [
    RouterModule
  ]
})

export class DlmRoutingModule { }
