import {Injectable} from '@angular/core';
import {CanActivate, Router} from '@angular/router';

import {AuthenticationService} from '../../services/authentication.service';
import {Observable} from 'rxjs/Observable';

@Injectable()
export class SignedInForSecureGuard implements CanActivate {
  constructor(private authenticationService: AuthenticationService) {
  }

  canActivate(): Observable<boolean> {
    return this.authenticationService.isAuthenticated();
  }

}

@Injectable()
export class NotSignedInForUnsecureGuard implements CanActivate {
  constructor(private authenticationService: AuthenticationService,
              private router: Router) {
  }

  canActivate() {
    this.authenticationService.isAuthenticated().subscribe(isAuthenticated => {
      if (isAuthenticated) {
        this.router.navigate(['']);
        return true;
      }
    });
    return true;
  }
}


@Injectable()
export class DoCleanUpAndRedirectGuard implements CanActivate {
  constructor(private authenticationService: AuthenticationService) {
  }

  canActivate() {
    return this.authenticationService.signOut();
  }
}
