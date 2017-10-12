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

import {ChangePasswordComponent} from './views/change-password/change-password.component';

export const routes: Routes = [{
  path: '',
  pathMatch: 'full',
  redirectTo: 'change-password'
}, {
  path: 'change-password',
  component: ChangePasswordComponent,
  data: {
    crumb: 'profile.password_change'
  }
}];
