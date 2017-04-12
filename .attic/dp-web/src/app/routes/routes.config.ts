import { Routes } from '@angular/router';

import { SignInComponent } from './sign-in/sign-in.component';

import { AlreadyLoggedInGuard, LoggedInGuard } from '../shared/utils/login-guard';
import { NotFoundRouteComponent } from './not-found-route/not-found-route.component';

export const routes: Routes = [{
    path: 'sign-in',
    component: SignInComponent,
    canActivate:[ AlreadyLoggedInGuard ]
  }, {
    path: 'onboard',
    loadChildren: './modules/onboard/onboard.module#OnboardModule',
    canActivate:[ LoggedInGuard ]
  }, {
    path: 'infra',
    loadChildren: './modules/infra/infra.module#InfraModule',
    canActivate:[ LoggedInGuard ]
  }, {
    path: 'dlm',
    loadChildren: './apps/dlm/dlm.module#DlmModule',
    canActivate:[ LoggedInGuard ]
  },{
    path: '**',
    component: NotFoundRouteComponent
  },
];
