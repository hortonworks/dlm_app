import { Routes } from '@angular/router';

import { EntryComponent } from './entry/entry.component';
import { FirstRunComponent } from './first-run/first-run.component';
import { SignInComponent } from './sign-in/sign-in.component';
import { LakeAddComponent } from './lake-add/lake-add.component';
import { DashboardComponent } from './dashboard/dashboard.component';

import { AlreadyLoggedInGuard, LoggedInGuard } from '../shared/utils/login-guard';
import { NotFoundRouteComponent } from './not-found-route/not-found-route.component';

export const routes: Routes = [{
    path: 'sign-in',
    component: SignInComponent,
    canActivate:[ AlreadyLoggedInGuard ]
  },{
    path: '',
    component: EntryComponent,
    canActivate:[ LoggedInGuard ]
  },{
    path: 'onboard',
    component: FirstRunComponent,
    canActivate:[ LoggedInGuard ]
  },{
    path: 'onboard/lake-add',
    component: LakeAddComponent,
    canActivate:[ LoggedInGuard ]
  },{
    path: 'dashboard',
    component: DashboardComponent
  },{
    path: 'dlm',
    loadChildren: './apps/dlm/dlm.module#DlmModule',
    canActivate: [LoggedInGuard]
  },{
    path: '**',
    component: NotFoundRouteComponent
  },
];
