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
import {LdapEditConfigComponent} from "./views/ldap-edit-config/ldap-edit-config.component";
import {SettingsComponent} from "./views/settings/settings.component";

export const routes: Routes = [{
    path: '',
    pathMatch: 'full',
    redirectTo: 'clusters'
  }, {
    path: 'clusters',
    data: {
      crumb: 'infra.clusters'
    },
    children: [{
      path: '',
      pathMatch: 'full',
      component: LakesComponent,
      data: {
        crumb: undefined
      }
    }, {
      path: 'add',
      component: ClusterAddComponent,
      data: {
        crumb: 'infra.clusters.add'
      }
    }, {
      path: ':id',
      component: ClusterDetailsComponent,
      data: {
        crumb: 'infra.clusters.cCluster'
      }
    }, {
      path: ':id/edit',
      component: ClusterEditComponent,
      data: {
        crumb: 'infra.clusters.cCluster.edit'
      }
    }]
  }, {
    path: 'services',
    data: {
      crumb: 'infra.services'
    },
    children: [{
      path: '',
      component: ServiceManagementComponent,
      data: {
        crumb: undefined
      },
    }, {
      path: 'add',
      component: ManualInstallCheckComponent,
      data: {
        crumb: 'infra.services.add'
      }
    }, {
      path: ':name/verify',
      component: VerificationComponent,
      data: {
        crumb: 'infra.services.cService.verify'
      }
    }]
  }, {
    path: 'manage-access',
    pathMatch: 'full',
    redirectTo: 'manage-access/users'
  }, {
    path: 'manage-access/identity-provider-edit',
    component: LdapEditConfigComponent,
    data: {
      crumb: 'infra.access.identity_provider_edit'
    },
  },{
    path: 'manage-access/users',
    component: UsersComponent,
    data: {
      crumb: 'infra.access.users'
    },
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
    data: {
      crumb: 'infra.access.groups'
    },
    children: [{
      path: 'add',
      component: AddGroupComponent,
      outlet: 'sidebar'
    }, {
      path: ':name/edit',
      component: AddGroupComponent,
      outlet: 'sidebar'
    }]
  }, {
  path: 'settings',
  component: SettingsComponent,
  data: {
    crumb: 'infra.settings'
  }
}];
