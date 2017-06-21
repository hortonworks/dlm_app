import {Injectable} from '@angular/core';
import {ActivatedRoute, ActivatedRouteSnapshot, CanActivate, Router} from '@angular/router';
import {Observable} from 'rxjs/Observable'

import {ConfigurationService} from '../../../services/configuration.service';


@Injectable()
export class ConfigCheckGuard implements CanActivate {
  constructor(private configService: ConfigurationService,
              private router: Router,
              private route: ActivatedRoute) {
  }

  canActivate(route: ActivatedRouteSnapshot) {
    let currentUrl = this.router.url;
    return Observable.create(observer => {
      this.configService.isLDAPConfigured().subscribe(isConfigured => {
        if (isConfigured) {
          observer.next(false);
          observer.complete();
          if(currentUrl === '/'){
            this.redirect(observer, true, '/infra');
          }
        } else {
          observer.next(true);
          observer.complete();
        }
      }, error => {
        observer.next(false);
        observer.complete();
        if(currentUrl === '/'){
          this.redirect(observer, true, '/infra');
        }
      });

    });
  }

  redirect(observer, canActivate, route) {
    observer.next(canActivate);
    observer.complete();
    if (route) {
      this.router.navigate([route]);
    }
  }
}
