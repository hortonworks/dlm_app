import {Injectable} from '@angular/core';
import {CanActivate, Router} from '@angular/router';
import {Observable} from 'rxjs/Observable'

import {AuthenticationService} from '../../services/authentication.service';
import {RbacService} from '../../services/rbac.service';
import {ConfigurationService} from '../../services/configuration.service';


@Injectable()
export class LandingPageGuard implements CanActivate {
  constructor(private authenticationService: AuthenticationService,
              private router: Router,
              private rbacService: RbacService,
              private configService: ConfigurationService) {
  }

  canActivate() {
    return Observable.create(observer => {
      this.configService.retrieve().subscribe(({lakeWasInitialized}) => {
        this.rbacService.getLandingPage(lakeWasInitialized).subscribe(landingPage => {
          this.redirect(observer, true, landingPage);
        });
      }, () => {
        this.redirect(observer, false);
        this.authenticationService.redirectToSignIn();
      });
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
