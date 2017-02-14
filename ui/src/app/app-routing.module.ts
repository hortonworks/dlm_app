import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {LoginComponent} from './login/login.component';
import {AlreadyLoggedInGuard, LoggedInGuard} from './shared/utils/login-gaurd';
import ViewClusterComponent from './components/view-cluster/view-cluster.component';
import {DataManagerComponent} from './components/data-manager/data-manager.component';
import {LogoutComponent} from './logout/logout.component';

export const routes = [
  { path: '', component: LoginComponent,canActivate:[AlreadyLoggedInGuard]},
  { path: 'ui', component: LoginComponent,canActivate:[AlreadyLoggedInGuard]},
  { path: 'ui/login', component: LoginComponent,canActivate:[AlreadyLoggedInGuard]},
  { path: 'ui/logout', component: LogoutComponent},
  { path: 'ui/data-lake/:id', component: ViewClusterComponent},
  { path: 'ui/dashboard', loadChildren: 'app/components/dashboard/dashboard.module#DashboardModule', canActivate: [LoggedInGuard]},
  { path: 'ui/add-data-lake', loadChildren: 'app/components/add-cluster/add-cluster.module#AddClusterModule', canActivate: [LoggedInGuard]},
  { path: 'ui/view-data', loadChildren: 'app/components/view-data/view-data.module#ViewDataModule', canActivate: [LoggedInGuard]},
  { path: 'ui/backup-policy/:key', loadChildren: 'app/components/add-bdr/add-bdr.module#AddBdrModule', canActivate: [LoggedInGuard]},
  { path: 'ui/backup-policy', loadChildren: 'app/components/add-bdr/add-bdr.module#AddBdrModule', canActivate: [LoggedInGuard]},
  { path: 'ui/data-manager', component: DataManagerComponent, canActivate: [LoggedInGuard]},
  { path: 'ui/data-analyst/analyst-dashboard', loadChildren: 'app/components/data-analyst/analyst-dashboard/analyst-dashboard.module#AnalystDashboardModule',canActivate:[LoggedInGuard]},
  { path: 'ui/data-analyst/dataset/add', loadChildren: 'app/components/data-analyst/add-data-set/add-data-set.module#AddDataSetModule',canActivate:[LoggedInGuard]},
  { path: 'ui/data-analyst/dataset/view/:id', loadChildren: 'app/components/data-analyst/view-data-set/view-data-set.module#ViewDataSetModule',canActivate:[LoggedInGuard]},
]

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  providers: []
})
export class WebappRoutingModule { }
