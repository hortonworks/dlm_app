import {ModuleWithProviders} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import DashboardComponent  from './components/dashboard/dashboard';
import LoginComponent  from './components/login';
import ViewClusterComponent from './components/view-cluster/view-cluster.component';

export const routes = [
    { path: 'ui', component: LoginComponent },
    { path: 'ui/login', component: LoginComponent},
    { path: 'ui/dashboard', component: DashboardComponent},
    { path: 'ui/view-cluster/:id', component: ViewClusterComponent},
    { path: 'ui/add-cluster', loadChildren: 'assets/app/components/add-cluster/add-cluster.module#AddClusterModule'}
];