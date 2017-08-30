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
import {CanActivate, Router} from '@angular/router';

import {AuthenticationService} from '../../services/authentication.service';
import {Observable} from 'rxjs/Observable';
import {AuthUtils} from './auth-utils';

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
