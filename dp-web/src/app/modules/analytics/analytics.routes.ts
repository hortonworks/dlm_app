import { Routes } from '@angular/router';

import {WorkspaceComponent} from './workspace/workspace.component';
import {AddWorkspaceComponent} from './workspace/add-workspace/add-workspace.component';
import {AssetsComponent} from './workspace/assets/assets.component';

export const analyticsRoutes: Routes = [
  {path: '',  component: WorkspaceComponent},
  {path: ':id/assets', component: AssetsComponent},
  {path: 'add-workspace/:id', component: AddWorkspaceComponent, outlet: 'dialog'}
];
