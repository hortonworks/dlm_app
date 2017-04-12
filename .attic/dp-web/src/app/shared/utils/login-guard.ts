import { Injectable } from '@angular/core';
import { CanActivate, Router} from '@angular/router';

import { AuthenticationService } from '../../services/authentication.service';

@Injectable()
export class LoggedInGuard implements CanActivate {
  constructor(
    private authenticationService: AuthenticationService,
    private router: Router
  ) {}

  canActivate() {

    if(this.authenticationService.isAuthenticated()) {
      return true;
    }

    // not logged in so redirect to login page
    this.router.navigate(['sign-in']);
    return false;

  }
}

@Injectable()
export class AlreadyLoggedInGuard implements CanActivate {
  constructor(
    private authenticationService: AuthenticationService,
    private router: Router
  ) {}

  canActivate() {
    if(this.authenticationService.isAuthenticated()) {
      // check if is first run
      this.router.navigate(['onboard']);
      return true;
    }
    return true;
  }
}
