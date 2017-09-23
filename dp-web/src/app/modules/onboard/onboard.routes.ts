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

import {DpOnboardComponent} from './views/dp-onboard/dp-onboard.component';
import {LdapConfigComponent} from './views/ldap-config/ldap-config.component';
import {UserAddComponent} from './views/user-add/user-add.component';
import {FirstRunComponent} from './views/first-run/first-run.component';

import {StatusCheckGuard} from './guards/status-check-guard';
import {ConfigCheckGuard} from './guards/config-check-guard';

export const routes: Routes = [{
    path: '',
    component: FirstRunComponent
  }, {
    path: 'welcome',
    component: DpOnboardComponent
  }, {
    path: 'identity-provider',
    component: LdapConfigComponent,
    canActivate: [ConfigCheckGuard]
  }, {
    path: 'users-and-groups',
    component: UserAddComponent,
    canActivate: [StatusCheckGuard]
}];
