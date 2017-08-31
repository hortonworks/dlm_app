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
import {ActivatedRoute, ActivatedRouteSnapshot, CanActivate, Router} from '@angular/router';
import {Observable} from 'rxjs/Observable'

import {ConfigurationService} from '../../../services/configuration.service';


@Injectable()
export class ConfigCheckGuard implements CanActivate {
  constructor(private configService: ConfigurationService,
              private router: Router) {
  }

  canActivate(route: ActivatedRouteSnapshot) {
    return Observable.create(observer => {
      if (this.router.url.startsWith('/onboard/adduser') || this.router.url === '/onboard/welcome') {
        this.redirect(observer, true);
      } else {
        this.redirect(observer, false, '/');
      }
    });
  }

  redirect(observer, canActivate, route?) {
    observer.next(canActivate);
    observer.complete();
    if (route) {
      this.router.navigate([route]);
    }
  }
}
