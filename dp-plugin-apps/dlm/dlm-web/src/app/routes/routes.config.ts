import { Routes } from '@angular/router';

import { OverviewComponent } from 'pages/overview/overview.component';
import { ClustersComponent } from 'pages/clusters/clusters.component';
import { PairingsComponent } from 'pages/pairings/pairings.component';
import { PoliciesComponent } from 'pages/policies/policies.component';
import { JobsComponent } from 'pages/jobs/jobs.component';
import { NotificationsPageComponent } from 'pages/notifications/notifications.component';
import { HelpComponent } from 'pages/help/help.component';
import { CreatePolicyComponent } from 'pages/policies/subpages/create-policy/create-policy.component';
import { CreatePairingComponent } from 'pages/pairings/subpages/create-pairing/create-pairing.component';
import { ReviewPolicyComponent } from 'pages/policies/subpages/review-policy/review-policy.component';

import { NotFoundRouteComponent } from './not-found-route/not-found-route.component';

/**
 * Parent-child routes should be defined in such way:
 * - parent should have only `path` and no `component`
 * - first child should have path `''` and pathMatch `'full'`. This route should contain `component` with list of all models
 * - other child routes may be any you need
 *
 * As example see routes 'Policies' and 'Pairings'
 */
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
    children: [
      {
        path: '',
        pathMatch: 'full',
        component: PairingsComponent
      },
      {
        path: 'create',
        component: CreatePairingComponent
      }
    ]
  },
  {
    path: 'policies',
    children: [
      {
        path: '',
        pathMatch: 'full',
        component: PoliciesComponent
      },
      {
        path: 'create',
        component: CreatePolicyComponent,
        data: {
          // todo: How to achieve translate here? Should we move breadcrumb label change to service?
          breadcrumb: 'Create Replication Policy'
        }
      },
      {
        path: 'review',
        component: ReviewPolicyComponent,
        data: {
          breadcrumb: 'Create Replication Policy'
        }
      }
    ]
  },
  {
    path: 'jobs',
    component: JobsComponent
  },
  {
    path: 'notifications',
    component: NotificationsPageComponent
  },
  {
    path: 'help',
    component: HelpComponent
  }, {
    path: '**',
    component: NotFoundRouteComponent
  },
];
