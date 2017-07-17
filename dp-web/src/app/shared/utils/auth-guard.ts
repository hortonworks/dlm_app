import {Injectable} from '@angular/core';
import {CanActivate, Router} from '@angular/router';

import {AuthenticationService} from '../../services/authentication.service';
import {Observable} from 'rxjs/Observable';

@Injectable()
export class SecuredRouteGuard implements CanActivate {
  constructor(private authenticationService: AuthenticationService, private router: Router) {
  }

  canActivate(): Observable<boolean> {
    return Observable.create(observer => {
      this.authenticationService.isAuthenticated().subscribe((isAuthenticated) => {
        if (isAuthenticated) {
          return observer.next(true);
        } else {
          this.router.navigate(['']);
          return observer.next(false);
        }
      }, () => {
        this.router.navigate(['']);
        return observer.next(false);
      })
    });
  }
}

@Injectable()
export class UnsecuredRouteGuard implements CanActivate {
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
