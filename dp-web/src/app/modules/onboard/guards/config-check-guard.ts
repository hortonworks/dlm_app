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
