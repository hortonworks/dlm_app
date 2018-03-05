import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {TranslateModule} from '@ngx-translate/core';
import {RouterModule} from '@angular/router';

import { DataLakeDashboardComponent } from './data-lake-dashboard.component';
import {routes} from './data-lake-dashboard.routes';
import {ProfilerService} from '../../services/profiler.service';


@NgModule({
  imports: [
    CommonModule,
    TranslateModule,
    RouterModule.forChild(routes)
  ],
  declarations: [DataLakeDashboardComponent],
  providers: [ProfilerService]
})
export class DataLakeDashboardModule { }
