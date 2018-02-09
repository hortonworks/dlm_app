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
import {Observable} from 'rxjs/Observable'

import {RbacService} from '../../services/rbac.service';
import {ConfigurationService} from '../../services/configuration.service';

@Injectable()
export class LandingPageGuard implements CanActivate {
  constructor(private router: Router,
              private rbacService: RbacService,
              private configService: ConfigurationService) {
  }

  canActivate() {
    return Observable.create(observer => {
      this.configService.retrieve().subscribe(({lakeWasInitialized}) => {
        this.rbacService.getLandingPage(lakeWasInitialized).subscribe(landingPage => {
          this.redirect(observer, true, landingPage);
        });
      }, (error) => {
        console.error(error);
      });
    });
  }

  redirect(observer, canActivate, route?) {
    observer.next(canActivate);
    observer.complete();
    if (route) {
      if (this.router.config.filter(r => r.path === `/${route}`).length) {
        this.router.navigate([route]);
      } else {
        window.location.pathname = route;
      }
    }
  }
}
