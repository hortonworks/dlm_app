import { Routes } from '@angular/router';

import { DlmComponent } from '../dlm.component';
import { OverviewComponent } from '../pages/overview/overview.component';
import { ClustersComponent } from '../pages/clusters/clusters.component';
import { PairingsComponent } from '../pages/pairings/pairings.component';
import { PoliciesComponent } from '../pages/policies/policies.component';
import { JobsComponent } from '../pages/jobs/jobs.component';
import { HelpComponent } from '../pages/help/help.component';
import { CreatePolicyComponent } from '../pages/policies/subpages/create-policy/create-policy.component';

import { NotFoundRouteComponent } from './not-found-route/not-found-route.component';

export const routes: Routes = [{
    path: '',
    redirectTo: '/overview',
    pathMatch: 'full'
  }, {
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
    path: 'policies/create',
    component: CreatePolicyComponent
  },
  {
    path: 'jobs',
    component: JobsComponent
  },
  {
    path: 'help',
    component: HelpComponent
  }, {
    path: '**',
    component: NotFoundRouteComponent
  },
];
