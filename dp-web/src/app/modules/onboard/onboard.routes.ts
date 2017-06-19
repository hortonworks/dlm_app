import {Routes} from '@angular/router';

import {DpOnboardComponent} from './views/dp-onboard/dp-onboard.component';
import {LakesComponent} from './views/lakes/lakes.component';
import {DataSetComponent} from './views/datasets/datasets.component';
import {LdapConfigComponent} from './views/dp-onboard/ldap-config/ldap-config.component';
import {UserAddComponent} from './views/dp-onboard/user-add/user-add.component';
import {FirstRunComponent} from './views/first-run/first-run.component';
import {StatusCheckGuard} from './status-check-guard';

export const routes: Routes = [{
  path: '',
  component: FirstRunComponent
}, {
  path: 'welcome',
  component: DpOnboardComponent
}, {
  path: 'configure',
  component: LdapConfigComponent
}, {
  path: 'adduser',
  component: UserAddComponent
  //canActivate: [StatusCheckGuard],
}, {
  path: 'lakes',
  component: LakesComponent
}, {
  path: 'dataset-add',
  component: DataSetComponent
}, {
  path: 'dataset-edit/:id',
  component: DataSetComponent
}
];
