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
