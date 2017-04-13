import { Injectable } from '@angular/core';
import { CanActivate, Router} from '@angular/router';

import { AuthenticationService } from '../../services/authentication.service';

@Injectable()
export class SignedInForSecureGuard implements CanActivate {
  constructor(
    private authenticationService: AuthenticationService,
    private router: Router
  ) {}

  canActivate() {
    if(this.authenticationService.isAuthenticated()) {
      return true;
    }

    // not logged in so redirect to login page
    this.router.navigate(['sign-in', {
      cause: 'unauthenticated'
    }]);
    return false;
  }
}

@Injectable()
export class NotSignedInForUnsecureGuard implements CanActivate {
  constructor(
    private authenticationService: AuthenticationService,
    private router: Router
  ) {}

  canActivate() {
    if(this.authenticationService.isAuthenticated()) {
      // check if is first run
      // where to go
      this.router.navigate(['onboard']);
      return true;
    }
    return true;
  }
}

@Injectable()
export class DoCleanUpAndRedirectGuard implements CanActivate {
  constructor(
    private authenticationService: AuthenticationService,
    private router: Router
  ) {}

  canActivate() {
      this.authenticationService.signOut();
      this.router.navigate(['sign-in', {
        cause: 'sign-out'
      }]);

      return true;
  }
}
