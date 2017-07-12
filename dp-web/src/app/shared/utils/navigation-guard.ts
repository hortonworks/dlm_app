import {Injectable} from '@angular/core';
import {CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router} from '@angular/router';
import {User} from '../../models/user';
import {RbacService} from '../../services/rbac.service';


@Injectable()
export class NavigationGuard implements CanActivate {
  constructor(private router: Router, private rbacService: RbacService) {
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    if (this.rbacService.isAuthorized(state.url)) {
      return true;
    } else {
      this.router.navigate(['/unauthorized']);
      return false;
    }
  }
}
