import { ModuleWithProviders } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MainComponent } from './pages/main/main.component';
import { OverviewComponent } from './pages/overview/overview.component';
import { ClustersComponent } from './pages/clusters/clusters.component';
import { PairingsComponent } from './pages/pairings/pairings.component';
import { PoliciesComponent } from './pages/policies/policies.component';
import { JobsComponent } from './pages/jobs/jobs.component';
import { HelpComponent } from './pages/help/help.component';
import { LoggedInGuard } from '../../shared/utils/login-guard';

const routes: Routes = [
  {
    path: '',
    component: MainComponent
  },
  {
    path: 'overview',
    component: OverviewComponent,
    canActivate: [LoggedInGuard]
  },
  {
    path: 'clusters',
    component: ClustersComponent,
    canActivate: [LoggedInGuard]
  },
  {
    path: 'pairings',
    component: PairingsComponent,
    canActivate: [LoggedInGuard]
  },
  {
    path: 'policies',
    component: PoliciesComponent,
    canActivate: [LoggedInGuard]
  },
  {
    path: 'jobs',
    component: JobsComponent,
    canActivate: [LoggedInGuard]
  },
  {
    path: 'help',
    component: HelpComponent,
    canActivate: [LoggedInGuard]
  },
];

export const routing: ModuleWithProviders = RouterModule.forChild(routes);
