import {Injectable} from '@angular/core';
import {CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router} from '@angular/router';
import {RbacService} from '../../services/rbac.service';
import {AuthUtils} from './auth-utils';

@Injectable()
export class NavigationGuard implements CanActivate {
  constructor(private router: Router, private rbacService: RbacService) {
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    if (!AuthUtils.isUserLoggedIn()) {
      AuthUtils.clearUser();
      window.location.href = AuthUtils.signoutURL;
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
