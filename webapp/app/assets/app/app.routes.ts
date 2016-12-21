import {ModuleWithProviders} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import DashboardComponent  from './components/dashboard/dashboard';
import LoginComponent  from './components/login';
import LogoutComponent  from './components/logout';
import ViewClusterComponent from './components/view-cluster/view-cluster.component';
import {LoggedInGuard, AlreadyLoggedInGuard} from './common/utils/login-gaurd';

export const routes = [
    { path: 'ui', component: LoginComponent,canActivate:[AlreadyLoggedInGuard]},
    { path: 'ui/login', component: LoginComponent,canActivate:[AlreadyLoggedInGuard]},
    { path: 'ui/logout', component: LogoutComponent},
    { path: 'ui/dashboard', component: DashboardComponent, canActivate: [LoggedInGuard]},
    { path: 'ui/view-cluster/:id', component: ViewClusterComponent},
    { path: 'ui/cluster/add', loadChildren: 'assets/app/components/add-cluster/add-cluster.module#AddClusterModule', canActivate: [LoggedInGuard]},
    { path: 'ui/view-data', loadChildren: 'assets/app/components/view-data/view-data.module#ViewDataModule', canActivate: [LoggedInGuard]},
    { path: 'ui/configure-bdr', loadChildren: 'assets/app/components/add-bdr/add-bdr.module#AddBdrModule', canActivate: [LoggedInGuard]}

];
