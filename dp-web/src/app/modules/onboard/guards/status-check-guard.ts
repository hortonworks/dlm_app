import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, Router} from '@angular/router';
import {Observable} from 'rxjs/Observable'

import {ConfigurationService} from '../../../services/configuration.service';


@Injectable()
export class StatusCheckGuard implements CanActivate {
  constructor(private configService: ConfigurationService,
              private router: Router) {
  }

  canActivate(route: ActivatedRouteSnapshot) {
    return Observable.create(observer => {
      this.configService.isKnoxConfigured().subscribe(response => {
        if (response.configured && this.router.url === '/onboard/configure') {
          this.redirect(observer, true);
        }else{
          this.redirect(observer, false, '/');
        }
      }, error => {
        this.redirect(observer, true, '/onboard/configure');
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
