import {Routes} from '@angular/router';

import {LakesComponent} from './views/lakes/lakes.component';
import {ClusterAddComponent} from './views/cluster-add/cluster-add.component';
import {ClusterDetailsComponent} from './views/cluster-details/cluster-details.component';
import {UserManagementComponent} from './views/user-management/user-management.component';
import {AddUserComponent} from './views/user-management/add-user/add-user.component';

export const routes: Routes = [{
  path: '',
  component: LakesComponent
}, {
  path: 'add',
  component: ClusterAddComponent
}, {
  path: 'cluster/details/:id',
  component: ClusterDetailsComponent
}, {
  path: 'users',
  component: UserManagementComponent,
  children: [
    {
      path: 'add',
      component: AddUserComponent,
      outlet: 'sidebar',
    },
    {
      path: 'edit/:id',
      component: AddUserComponent,
      outlet: 'sidebar',
    }
  ]
}];
