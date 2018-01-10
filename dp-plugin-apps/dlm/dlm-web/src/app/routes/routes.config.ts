/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

import { Routes } from '@angular/router';

import { OverviewComponent } from 'pages/overview/overview.component';
import { ClustersComponent } from 'pages/clusters/clusters.component';
import { CloudStoresComponent } from 'pages/cloud-stores/cloud-stores.component';
import { PairingsComponent } from 'pages/pairings/pairings.component';
import { PoliciesComponent } from 'pages/policies/policies.component';
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
    path: 'cloud-stores',
    component: CloudStoresComponent,
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
        component: CreatePolicyComponent,
        data: {
          breadcrumb: 'page.policies.header_create'
        }
      },
      {
        path: 'review',
        component: ReviewPolicyComponent,
        data: {
          breadcrumb: 'page.policies.header_create'
        }
      }
    ]
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
    component: NotFoundRouteComponent,
    data: {
      breadcrumb: 'page.not_found.breadcrumb'
    }
  },
];
