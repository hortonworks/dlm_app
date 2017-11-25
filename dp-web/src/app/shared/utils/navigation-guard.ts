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

import {Injectable} from '@angular/core';
import {CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router} from '@angular/router';
import {RbacService} from '../../services/rbac.service';
import {AuthenticationService} from '../../services/authentication.service';
import {AuthUtils} from './auth-utils';

@Injectable()
export class NavigationGuard implements CanActivate {
  constructor(private router: Router, private rbacService: RbacService, private authenticationService: AuthenticationService) {
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    if (!AuthUtils.isUserLoggedIn()) {
      this.authenticationService
        .signOutAndRedirect();
      return false;
    }
    if (!this.rbacService.isAuthorized(state.url)) {
      this.router.navigate(['/unauthorized']);
      return false;
    } else if (!this.rbacService.isServiceEnabled(state.url)) {
      this.router.navigate(['/service-notenabled']);
      return false;
    } else {
      return true;
    }
  }
}
