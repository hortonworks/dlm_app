import { Routes } from '@angular/router';

import {DatasetDashboardComponent} from "./views/dashboard/dataset-dashboard.component";
import {DsFullView} from "./views/ds-full-view/ds-full-view.component";

export const routes: Routes = [
  {
    path: '',
    component: DatasetDashboardComponent
  },{
    path: 'full-view/:id',
    component: DsFullView
  }
];
