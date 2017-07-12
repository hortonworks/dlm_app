import {Injectable} from '@angular/core';
import {CanActivate, Router} from '@angular/router';
import {Observable} from 'rxjs/Observable'

import {AuthenticationService} from '../../services/authentication.service';
import {ConfigurationService} from '../../services/configuration.service';
import 'rxjs/add/operator/first';
import {RbacService} from '../../services/rbac.service';


@Injectable()
export class LandingPageGuard implements CanActivate {
  constructor(private configService: ConfigurationService,
              private authenticationService: AuthenticationService,
              private router: Router,
              private rbacService: RbacService) {
  }

  canActivate() {
    return Observable.create(observer => {
      var isAuthenticated = this.authenticationService.isAuthenticated()
        .then(() => {
          this.rbacService.getLandingPage().subscribe(landingPage => {
            this.redirect(observer, true, landingPage);
          });
          // this.configService.isKnoxConfigured().subscribe(response => {
          //   if (!response.isConfigured) {
          //     this.redirect(observer, true, '/onboard/welcome');
          //   } else {
          //     this.configService.retrieve().subscribe(({lakeWasInitialized}) => {
          //       if (lakeWasInitialized) {
          //         this.redirect(observer, true, '/infra');
          //       } else {
          //         this.redirect(observer, true, '/onboard');
          //       }
          //     }, error => {
          //       this.authenticationService.redirectToSignIn();
          //     });
          //   }
          // }, ldapError => {
          //   this.redirect(observer, false);
          //   this.authenticationService.redirectToSignIn();
          // });
        })
        .catch(() => {
          this.redirect(observer, false);
          this.authenticationService.redirectToSignIn();
        })
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
