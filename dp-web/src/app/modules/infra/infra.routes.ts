import {Routes} from '@angular/router';

import {LakesComponent} from './views/lakes/lakes.component';
import {ClusterAddComponent} from './views/cluster-add/cluster-add.component';
import {ClusterDetailsComponent} from './views/cluster-details/cluster-details.component';
import {UserManagementComponent} from './views/user-management/user-management.component';
import {AddUserComponent} from './views/user-management/add-user/add-user.component';
import {AddGroupComponent} from './views/user-management/add-group/add-group.component';
import {UsersComponent} from './views/user-management/users/users.component';
import {GroupsComponent} from './views/user-management/groups/groups.component';
import {ServiceManagementComponent} from './views/service-management/service-management.component';
import {VerificationComponent} from './views/service-management/verification/verification.component';

// export const routes:Routes = [
//   { path: '', redirectTo: 'clusters' },
//   { path: 'clusters', component: LakesComponent },
//   { path: 'add', component: ClusterAddComponent },
//   { path: 'cluster/details/:id', component: ClusterDetailsComponent },
//   { path: 'users', component: UserManagementComponent,
//     children: [
//       { path: 'add', component: AddUserComponent, outlet: 'sidebar',},
//       { path: 'edit/:name', component: AddUserComponent, outlet: 'sidebar'}
//     ]
//   }
// ];
export const routes: Routes = [
  { path: '', redirectTo: 'clusters' },
  { path: 'clusters', component: LakesComponent },
  { path: 'add', component: ClusterAddComponent },
  { path: 'cluster/details/:id', component: ClusterDetailsComponent },
  { path: 'services', component: ServiceManagementComponent},
  { path: 'services/verify/:name', component: VerificationComponent},
  { path: 'usermgmt', component: UserManagementComponent,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'users'},
      { path: 'users', component: UsersComponent,
          children: [
            { path: 'add', component: AddUserComponent, outlet: 'sidebar',}, { path: 'edit/:name', component: AddUserComponent, outlet: 'sidebar',}
        ]
      },
    { path: 'groups', component: GroupsComponent,
      children: [
        { path: 'add', component: AddGroupComponent, outlet: 'sidebar',},
        { path: 'edit/:name', component: AddGroupComponent, outlet: 'sidebar',}
      ]
    }
  ]
}];
