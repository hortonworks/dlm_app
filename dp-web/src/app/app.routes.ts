import { Routes } from '@angular/router';

import { SignInComponent } from './views/sign-in/sign-in.component';

import { NotSignedInForUnsecureGuard, SignedInForSecureGuard, DoCleanUpAndRedirectGuard } from './shared/utils/auth-guard';
import { LandingPageGuard } from './shared/utils/landing-page-guard';
import { NotFoundRouteComponent } from './views/not-found-route/not-found-route.component';
import {NavigationGuard} from './shared/utils/navigation-guard';
import {AuthErrorComponent} from './shared/auth-error/auth-error.component';

export const routes: Routes = [{
    path: 'sign-in',
    component: SignInComponent,
    canActivate:[ NotSignedInForUnsecureGuard ]
  }, {
    path: 'sign-out',
    component: SignInComponent,
    canActivate: [
      DoCleanUpAndRedirectGuard,
    ]
  }, {
    path: 'datasteward',
    loadChildren: './modules/dataset/dataset.module#DatasetModule',
    canActivate:[ SignedInForSecureGuard, NavigationGuard ]
  }, {
    path: 'onboard',
    loadChildren: './modules/onboard/onboard.module#OnboardModule',
    canActivate:[ SignedInForSecureGuard, NavigationGuard ]
  }, {
    path: 'infra',
    loadChildren: './modules/infra/infra.module#InfraModule',
    canActivate:[ SignedInForSecureGuard, NavigationGuard]
  }, {
    path: 'dashboard',
    loadChildren: './modules/dashboard/dashboard.module#DashboardModule',
    canActivate:[ SignedInForSecureGuard, NavigationGuard ]
  },{
    path: 'assets',
    loadChildren: './modules/assets/asset.module#AssetModule',
    canActivate:[ SignedInForSecureGuard, NavigationGuard ]
  },{
    path: 'analytics',
    loadChildren: './modules/analytics/analytics.module#AnalyticsModule',
    canActivate:[ SignedInForSecureGuard, NavigationGuard ]
  },
  {
    path: 'unauthorized',
    component: AuthErrorComponent
  }, {
    path: '',
    pathMatch: 'full',
    component: SignInComponent,
    canActivate: [LandingPageGuard ]
  }, {
    path: '**',
    component: NotFoundRouteComponent
  },
];
