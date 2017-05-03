import { Injectable } from '@angular/core';
import { CanActivate, Router} from '@angular/router';
import {Observable} from 'rxjs/Observable'

import { AuthenticationService } from '../../services/authentication.service';
import { ConfigurationService } from '../../services/configuration.service';
import 'rxjs/add/operator/first';


@Injectable()
export class LandingPageGuard implements CanActivate {
  constructor(
    private authenticationService: AuthenticationService,
    private configService : ConfigurationService,
    private router: Router
  ) {}

  canActivate() {
    return Observable.create(observer => {
      this.configService.retrieve().subscribe(({lakeWasInitialized}) => {
        if(lakeWasInitialized) {
          this.redirect(observer, true, '/infra');
        } else {
           this.redirect(observer, true, '/onboard');
        }
      },error => {
        this.redirect(observer, true, '/sign-in');
      });

    });
  }
  redirect(observer, canActivate, route){
    observer.next(canActivate);
    observer.complete();
    if(route){
      this.router.navigate([route]);
    }
  }
}