import { Routes } from '@angular/router';

import {WorkspaceComponent} from './workspace/workspace.component';
import {AddWorkspaceComponent} from './workspace/add-workspace/add-workspace.component';
import {AssetsComponent} from './workspace/assets/assets.component';

export const analyticsRoutes: Routes = [
  {path: '',  redirectTo: 'workspace'},
  {path: 'workspace/:id',  redirectTo: 'workspace'},
  {path: 'workspace',  component: WorkspaceComponent,
    children:[
      {path: 'add-workspace/:id', component: AddWorkspaceComponent, outlet: 'dialog'}
    ]
  },
  {path: 'workspace/:id/assets', component: AssetsComponent}
];
