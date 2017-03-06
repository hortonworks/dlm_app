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
    this.router.navigate(['login']);
    return false;

  }
}

@Injectable()
export class AlreadyLoggedInGuard implements CanActivate {
  constructor(private authenticationService: AuthenticationService,private router: Router) {}

  canActivate() {
    if(this.authenticationService.isAuthenticated()) {
        this.router.navigate(['dashboard']);
        return true;
    }
    return true;
  }
}
