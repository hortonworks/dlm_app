import DashboardComponent  from './components/dashboard/dashboard';
import LoginComponent  from './components/login';
import LogoutComponent  from './components/logout';
import AddClusterComponent from './components/add-cluster/add-cluster.component';
import ViewClusterComponent from './components/view-cluster/view-cluster.component';
import {LoggedInGuard, AlreadyLoggedInGuard} from './common/utils/login-gaurd';

export const routes = [
    { path: 'ui', component: LoginComponent,canActivate:[AlreadyLoggedInGuard]},
    { path: 'ui/login', component: LoginComponent,canActivate:[AlreadyLoggedInGuard]},
    { path: 'ui/logout', component: LogoutComponent},
    { path: 'ui/dashboard', component: DashboardComponent, canActivate: [LoggedInGuard]},
    { path: 'ui/cluster/add', component: AddClusterComponent, canActivate: [LoggedInGuard]},
    { path: 'ui/cluster/:id', component: ViewClusterComponent, canActivate: [LoggedInGuard]}
];