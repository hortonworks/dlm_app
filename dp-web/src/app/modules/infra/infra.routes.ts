import {Routes} from '@angular/router';

import {LakesComponent} from './views/lakes/lakes.component';
import {ClusterAddComponent} from './views/cluster-add/cluster-add.component';
import {ClusterDetailsComponent} from './views/cluster-details/cluster-details.component';
import {UserManagementComponent} from './views/user-management/user-management.component';
import {AddUserComponent} from './views/user-management/add-user/add-user.component';

export const routes:Routes = [
  { path: '', redirectTo: 'clusters' },
  { path: 'clusters', component: LakesComponent },
  { path: 'add', component: ClusterAddComponent },
  { path: 'clusters/:id/details', component: ClusterDetailsComponent },
  { path: 'users', component: UserManagementComponent,
    children: [
      { path: 'add', component: AddUserComponent, outlet: 'sidebar',},
      { path: 'edit/:name', component: AddUserComponent, outlet: 'sidebar'}
    ]
  }
];
