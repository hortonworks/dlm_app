/*
 *
 *  * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *  *
 *  * Except as expressly permitted in a written agreement between you or your company
 *  * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 *  * reproduction, modification, redistribution, sharing, lending or other exploitation
 *  * of all or any part of the contents of this software is strictly prohibited.
 *
 */
import {Routes} from "@angular/router";
import {DataLakeDashboardComponent} from './data-lake-dashboard.component';

export const routes: Routes = [
  { path: 'dss/data-lake-dashboard', children: [
      {path: '', pathMatch: 'full', component: DataLakeDashboardComponent},
      {path: ':id', component: DataLakeDashboardComponent, pathMatch: 'full', data: {crumb: 'dashboard'}}
  ]}
];

