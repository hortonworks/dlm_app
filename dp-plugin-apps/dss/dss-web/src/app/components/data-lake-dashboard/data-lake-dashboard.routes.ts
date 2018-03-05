import {Routes} from "@angular/router";
import {DataLakeDashboardComponent} from './data-lake-dashboard.component';

export const routes: Routes = [
  { path: 'dss/data-lake-dashboard', children: [
      {path: '', pathMatch: 'full', component: DataLakeDashboardComponent},
      {path: ':id', component: DataLakeDashboardComponent, pathMatch: 'full', data: {crumb: 'dashboard'}}
  ]}
];


