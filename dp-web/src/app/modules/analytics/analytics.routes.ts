import { Routes } from '@angular/router';

import {WorkspaceComponent} from './workspace/workspace.component';
import {AddWorkspaceComponent} from './add-workspace/add-workspace.component';

export const routes: Routes = [
  {path: '',  component: WorkspaceComponent},
  {path: 'add-workspace/:id', component: AddWorkspaceComponent, outlet: 'dialog'},
];
