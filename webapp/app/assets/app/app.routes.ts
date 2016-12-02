import DashboardComponent  from './components/dashboard/dashboard';
import LoginComponent  from './components/login';
import AddClusterComponent from './components/add-cluster/add-cluster.component';
import ViewClusterComponent from './components/view-cluster/view-cluster.component';

export const routes = [
    { path: 'ui', component: LoginComponent },
    { path: 'ui/login', component: LoginComponent},
    { path: 'ui/dashboard', component: DashboardComponent},
    { path: 'ui/add-cluster', component: AddClusterComponent},
    { path: 'ui/view-cluster/:id', component: ViewClusterComponent}
];