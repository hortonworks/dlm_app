/*
 *
 *  * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *  *
 *  * Except as expressly permitted in a written agreement between you or your company
 *  * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 *  * reproduction, modification, redistribution, sharing, lending or other exploitation
 *  * of all or any part of the contents of this software is strictly prohibited.
 *
 */

import { Routes } from '@angular/router';

import { SignInComponent } from './views/sign-in/sign-in.component';

import { UnsecuredRouteGuard, DoCleanUpAndRedirectGuard } from './shared/utils/auth-guard';
import { LandingPageGuard } from './shared/utils/landing-page-guard';
import { NotFoundRouteComponent } from './views/not-found-route/not-found-route.component';
import {NavigationGuard} from './shared/utils/navigation-guard';
import {AuthErrorComponent} from './shared/auth-error/auth-error.component';
import {LoaderSpinComponent} from './shared/loader-spin/loader-spin.component';
import {ServiceErrorComponent} from './shared/service-error/service-error.component';

export const routes: Routes = [{
  path: 'onboard',
  loadChildren: './modules/onboard/onboard.module#OnboardModule',
  canActivate:[ NavigationGuard ],
  data: {
    crumb: 'onboard',
    title: 'core',
  }
}, {
  path: 'infra',
  loadChildren: './modules/infra/infra.module#InfraModule',
  canActivate:[ NavigationGuard ],
  data: {
    crumb: 'infra',
    title: 'core',
  }
}, {
  path: 'profile',
  loadChildren: './modules/profile/profile.module#ProfileModule',
  canActivate:[ NavigationGuard ],
  data: {
    crumb: 'profile',
    title: 'core',
  }
}, {
  path: 'sign-in',
  component: SignInComponent,
  canActivate:[ UnsecuredRouteGuard ],
  data: {
    title: 'core',
  }
}, {
  path: 'sign-out',
  component: SignInComponent,
  canActivate: [ DoCleanUpAndRedirectGuard ],
  data: {
    title: 'core',
  }
}, {
  path: 'unauthorized',
  component: AuthErrorComponent,
  data: {
    crumb: 'unauthorized',
    title: 'core',
  }
}, {
  path: 'service-notenabled',
  component: ServiceErrorComponent,
  data: {
    crumb: 'service_not_enabled',
    title: 'core',
  }
},{
  path: '',
  pathMatch: 'full',
  component: LoaderSpinComponent,
  canActivate: [ LandingPageGuard ],
  data: {
    title: 'core',
  }
}, {
  path: '**',
  component: NotFoundRouteComponent,
  data: {
    crumb: 'not_found',
    title: 'core',
  }
}];
