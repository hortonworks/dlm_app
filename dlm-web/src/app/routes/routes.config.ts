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

import { Routes } from '@angular/router';

import { OverviewComponent } from 'pages/overview/overview.component';
import { ClustersComponent } from 'pages/clusters/clusters.component';
import { CloudAccountsComponent } from 'pages/cloud-accounts/cloud-accounts.component';
import { PairingsComponent } from 'pages/pairings/pairings.component';
import { PoliciesComponent } from 'pages/policies/policies.component';
import { NotificationsPageComponent } from 'pages/notifications/notifications.component';
import { CreatePolicyComponent } from 'pages/policies/subpages/create-policy/create-policy.component';
import { CreatePairingComponent } from 'pages/pairings/subpages/create-pairing/create-pairing.component';

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
    pathMatch: 'full',
    component: ClustersComponent
  },
  {
    path: 'cloud-accounts',
    pathMatch: 'full',
    component: CloudAccountsComponent,
    data: {
      breadcrumb: 'page.cloud_stores.header'
    }
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
        component: CreatePairingComponent,
        data: {
          breadcrumb: 'page.pairings.create.header'
        }
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
        pathMatch: 'full',
        component: CreatePolicyComponent
      },
      {
        path: 'edit/:policyId/:step',
        pathMatch: 'full',
        component: CreatePolicyComponent
      }
    ]
  },
  {
    path: 'notifications',
    pathMatch: 'full',
    component: NotificationsPageComponent
  },
  {
    path: '**',
    component: NotFoundRouteComponent,
    data: {
      breadcrumb: 'page.not_found.breadcrumb'
    }
  },
];
