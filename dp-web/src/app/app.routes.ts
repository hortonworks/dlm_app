import { Routes } from '@angular/router';

import { SignInComponent } from './views/sign-in/sign-in.component';

import { NotSignedInForUnsecureGuard, SignedInForSecureGuard, DoCleanUpAndRedirectGuard } from './shared/utils/auth-guard';
import { LandingPageGuard } from './shared/utils/landing-page-guard';
import { NotFoundRouteComponent } from './views/not-found-route/not-found-route.component';

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
    path: 'onboard',
    loadChildren: './modules/onboard/onboard.module#OnboardModule',
    canActivate:[ SignedInForSecureGuard ]
  }, {
    path: 'infra',
    loadChildren: './modules/infra/infra.module#InfraModule',
    canActivate:[ SignedInForSecureGuard ]
  }, {
    path: 'dashboard',
    loadChildren: './modules/dashboard/dashboard.module#DashboardModule',
    canActivate:[ SignedInForSecureGuard ]
  }, {
    path: '',
    pathMatch: 'full',
    component: SignInComponent,
    canActivate: [ LandingPageGuard ]
  }, {
    path: '**',
    component: NotFoundRouteComponent
  },
];
