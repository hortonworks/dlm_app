import { Routes } from '@angular/router';

import { FirstRunComponent } from './first-run/first-run.component';
import { SignInComponent } from './sign-in/sign-in.component';
import { LakeAddComponent } from './lake-add/lake-add.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { LogoutComponent } from '../logout/logout.component';

import { AlreadyLoggedInGuard, LoggedInGuard } from '../shared/utils/login-guard';
import { ViewClusterComponent } from '../components/view-cluster/view-cluster.component';
import { DataManagerComponent } from '../components/data-manager/data-manager.component';
import { NotFoundRouteComponent } from './not-found-route/not-found-route.component';

export const routes: Routes = [{
    path: '',
    component: SignInComponent,
    canActivate:[ AlreadyLoggedInGuard ]
  },{
    path: 'sign-in',
    component: SignInComponent,
    canActivate:[ AlreadyLoggedInGuard ]
  },{
    path: 'first-run',
    component: FirstRunComponent,
    canActivate:[ LoggedInGuard ]
  },{
    path: 'lake-add',
    component: LakeAddComponent,
    canActivate:[ LoggedInGuard ]
  },{
    path: 'logout',
    component: LogoutComponent
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
