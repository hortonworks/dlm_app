import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';

import {LoginComponent} from '../login/login.component';
import {LogoutComponent} from '../logout/logout.component';

import {AlreadyLoggedInGuard, LoggedInGuard} from '../shared/utils/login-guard';
import {ViewClusterComponent} from '../components/view-cluster/view-cluster.component';
import {DataManagerComponent} from '../components/data-manager/data-manager.component';

export const ROUTES: Routes = [
  {path: '', component: LoginComponent, canActivate:[AlreadyLoggedInGuard]},
  {path: 'login', component: LoginComponent, canActivate:[AlreadyLoggedInGuard]},
  {path: 'logout', component: LogoutComponent},
  {path: 'data-lake/:id', component: ViewClusterComponent},
  {path: 'dashboard', loadChildren: './components/dashboard/dashboard.module#DashboardModule', canActivate: [LoggedInGuard]},
  {path: 'add-data-lake', loadChildren: './components/add-cluster/add-cluster.module#AddClusterModule', canActivate: [LoggedInGuard]},
  {path: 'view-data', loadChildren: './components/view-data/view-data.module#ViewDataModule', canActivate: [LoggedInGuard]},
  {path: 'backup-policy/:key', loadChildren: './components/add-bdr/add-bdr.module#AddBdrModule', canActivate: [LoggedInGuard]},
  {path: 'backup-policy', loadChildren: './components/add-bdr/add-bdr.module#AddBdrModule', canActivate: [LoggedInGuard]},
  {path: 'data-manager', component: DataManagerComponent, canActivate: [LoggedInGuard]},
  {path: 'data-analyst/analyst-dashboard', loadChildren: './components/data-analyst/analyst-dashboard/analyst-dashboard.module#AnalystDashboardModule', canActivate:[LoggedInGuard]},
  {path: 'data-analyst/dataset/add', loadChildren: './components/data-analyst/add-data-set/add-data-set.module#AddDataSetModule', canActivate:[LoggedInGuard]},
  {path: 'data-analyst/dataset/view/:id', loadChildren: './components/data-analyst/view-data-set/view-data-set.module#ViewDataSetModule', canActivate:[LoggedInGuard]},
];

export const RoutesModule = RouterModule.forRoot(ROUTES);
