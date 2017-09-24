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

import {Routes} from '@angular/router';

import {LakesComponent} from './views/lakes/lakes.component';
import {ClusterAddComponent} from './views/cluster-add/cluster-add.component';
import {ClusterEditComponent} from './views/cluster-edit/cluster-edit.component';
import {ClusterDetailsComponent} from './views/cluster-details/cluster-details.component';
import {AddUserComponent} from './views/user-management/add-user/add-user.component';
import {AddGroupComponent} from './views/user-management/add-group/add-group.component';
import {UsersComponent} from './views/user-management/users/users.component';
import {GroupsComponent} from './views/user-management/groups/groups.component';
import {ServiceManagementComponent} from './views/service-management/service-management.component';
import {VerificationComponent} from './views/service-management/verification/verification.component';
import {ManualInstallCheckComponent} from './views/service-management/manual-install-check/manual-install-check.component';

export const routes: Routes = [{
    path: '',
    pathMatch: 'full',
    redirectTo: 'clusters'
  }, {
    path: 'clusters',
    component: LakesComponent
  }, {
    path: 'clusters/add',
    component: ClusterAddComponent
  }, {
    path: 'clusters/:id',
    component: ClusterDetailsComponent
  }, {
    path: 'clusters/:id/edit',
    component: ClusterEditComponent
  }, {
    path: 'services',
    component: ServiceManagementComponent
  }, {
    path: 'services/add',
    component: ManualInstallCheckComponent
  }, {
    path: 'services/:name/verify',
    component: VerificationComponent
  }, {
    path: 'manage-access',
    pathMatch: 'full',
    redirectTo: 'manage-access/users'
  }, {
    path: 'manage-access/users',
    component: UsersComponent,
    children: [{
      path: 'add',
      component: AddUserComponent,
      outlet: 'sidebar'
    }, {
      path: ':name/edit',
      component: AddUserComponent,
      outlet: 'sidebar'
    }]
  }, {
    path: 'manage-access/groups',
    component: GroupsComponent,
    children: [{
      path: 'add',
      component: AddGroupComponent,
      outlet: 'sidebar'
    }, {
      path: ':name/edit',
      component: AddGroupComponent,
      outlet: 'sidebar'
    }]
}];
