import { Routes } from '@angular/router';

import {DatasetDashboardComponent} from "./views/dashboard/dataset-dashboard.component";
import {DsFullView} from "./views/ds-full-view/ds-full-view.component";
import {DsEditor} from "./views/ds-editor/ds-editor.component";

export const routes: Routes = [
  {
    path: '',
    component: DatasetDashboardComponent
  },{
    path: 'full-view/:id',
    component: DsFullView
  },{
    path: 'add',
    component: DsEditor
  },{
    path: 'edit/:id',
    component: DsEditor
  },{
    path: 'edit',
    component: DsEditor
  }


];
