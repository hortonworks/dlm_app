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
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {TranslateModule} from '@ngx-translate/core';
import {RouterModule} from '@angular/router';

import { ProfilersDashboardComponent } from './profilers-dashboard.component';
import {ProfilerJobsComponent} from './jobs/jobs.component';
import {ProfilerConfigsComponent} from './configurations/configs.component';
import {routes} from './profilers-dashboard.routes';


@NgModule({
  imports: [
    CommonModule,
    TranslateModule,
    RouterModule.forChild(routes)
  ],
  declarations: [
  	ProfilersDashboardComponent,
  	ProfilerJobsComponent,
  	ProfilerConfigsComponent
  ],
  providers: []
})
export class ProfilersDashboardModule { }
