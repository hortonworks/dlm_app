import { Routes } from '@angular/router';

import { FirstRunComponent } from './first-run/first-run.component';
import { SignInComponent } from './sign-in/sign-in.component';
import { LogoutComponent } from '../logout/logout.component';

import { AlreadyLoggedInGuard, LoggedInGuard } from '../shared/utils/login-guard';
import { ViewClusterComponent } from '../components/view-cluster/view-cluster.component';
import { DataManagerComponent } from '../components/data-manager/data-manager.component';
import { NotFoundRouteComponent } from './not-found-route/not-found-route.component';

// import { BreadcrumbResolve } from '../resolvers/breadcrumb.resolve';

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
    path: 'logout',
    component: LogoutComponent
  },{
    path: 'data-lake/:id',
    component: ViewClusterComponent
  },{
    path: 'dashboard',
    loadChildren: './components/dashboard/dashboard.module#DashboardModule',
    canActivate: [ LoggedInGuard ],
    // data: {
    //   crumb: 'Dashboard'
    // },
  },{
    path: 'add-data-lake',
    loadChildren: './components/add-cluster/add-cluster.module#AddClusterModule',
    canActivate: [ LoggedInGuard ]
  },{
    path: 'view-data',
    loadChildren: './components/view-data/view-data.module#ViewDataModule',
    canActivate: [ LoggedInGuard ],
    // resolve: {
    //   crumb: 'crumb'
    // },
  },{
    path: 'backup-policy/:key',
    loadChildren: './components/add-bdr/add-bdr.module#AddBdrModule',
    canActivate: [ LoggedInGuard ]
  },{
    path: 'backup-policy',
    loadChildren: './components/add-bdr/add-bdr.module#AddBdrModule',
    canActivate: [ LoggedInGuard ]
  },{
    path: 'data-manager',
    component: DataManagerComponent,
    canActivate: [ LoggedInGuard ]
  },{
    path: 'data-analyst/analyst-dashboard',
    loadChildren: './components/data-analyst/analyst-dashboard/analyst-dashboard.module#AnalystDashboardModule',
    canActivate:[ LoggedInGuard ]
  },{
    path: 'data-analyst/dataset/add',
    loadChildren: './components/data-analyst/add-data-set/add-data-set.module#AddDataSetModule',
    canActivate:[ LoggedInGuard ]
  },{
    path: 'data-analyst/dataset/view/:id',
    loadChildren: './components/data-analyst/view-data-set/view-data-set.module#ViewDataSetModule',
    canActivate:[ LoggedInGuard ]
  },{
    path: '**',
    component: NotFoundRouteComponent
  },
];
