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
      this.configService.isConfigurationComplete().subscribe(isComplete => {
        if (isComplete) {
          observer.next(true);
          observer.complete();
        } else {
          this.redirect(observer, true, '/onboard/configure');
        }
      }, error => {
        this.redirect(observer, true, '/onboard/configure');
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
