import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { routes } from './dashboard.routes';
import { DashboardComponent } from './views/dashboard/dashboard.component';

@NgModule({
  imports: [
    CommonModule,

    RouterModule.forChild(routes),
  ],
  declarations: [DashboardComponent]
})
export class DashboardModule { }
