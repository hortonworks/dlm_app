import { Routes } from '@angular/router';

import { SignInComponent } from './views/sign-in/sign-in.component';

import { UnsecuredRouteGuard, SecuredRouteGuard, DoCleanUpAndRedirectGuard } from './shared/utils/auth-guard';
import { LandingPageGuard } from './shared/utils/landing-page-guard';
import { NotFoundRouteComponent } from './views/not-found-route/not-found-route.component';
import {NavigationGuard} from './shared/utils/navigation-guard';
import {AuthErrorComponent} from './shared/auth-error/auth-error.component';
import {LoaderSpinComponent} from './shared/loader-spin/loader-spin.component';

export const routes: Routes = [{
    path: 'sign-in',
    component: SignInComponent,
    canActivate:[ UnsecuredRouteGuard ]
  }, {
    path: 'sign-out',
    component: SignInComponent,
    canActivate: [
      DoCleanUpAndRedirectGuard,
    ]
  }, {
    path: 'dataset',
    loadChildren: './modules/dataset/dataset.module#DatasetModule',
    canActivate:[ NavigationGuard ]
  }, {
    path: 'onboard',
    loadChildren: './modules/onboard/onboard.module#OnboardModule',
    canActivate:[ NavigationGuard ]
  }, {
    path: 'infra',
    loadChildren: './modules/infra/infra.module#InfraModule',
    canActivate:[ NavigationGuard]
  }, {
    path: 'dashboard',
    loadChildren: './modules/dashboard/dashboard.module#DashboardModule',
    canActivate:[ NavigationGuard ]
  },{
    path: 'assets',
    loadChildren: './modules/assets/asset.module#AssetModule',
    canActivate:[ NavigationGuard ]
  },{
    path: 'workspace',
    loadChildren: './modules/analytics/analytics.module#AnalyticsModule',
    canActivate:[ NavigationGuard ]
  },
  {
    path: 'unauthorized',
    component: AuthErrorComponent
  }, {
    path: '',
    pathMatch: 'full',
    component: LoaderSpinComponent,
    canActivate: [LandingPageGuard ]
  }, {
    path: '**',
    component: NotFoundRouteComponent
  },
];
