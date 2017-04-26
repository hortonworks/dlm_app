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
      if(!this.authenticationService.isUserLoggedIn()) {
        this.redirect(observer, true, '/sign-in');
        return;
      }
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


//     });
//     return new Promise((resolve,reject)=>{
//       if(!this.authenticationService.isUserLoggedIn()) {
//         resolve(true);
//         this.router.navigate(['/sign-in']);
//       } else {
//         this.configService.retrieve().subscribe(
//           ({lakeWasInitialized}) => {
//             if(lakeWasInitialized) {
//               resolve(true);
//               this.router.navigate(['/infra']);
//             } else {
//               resolve(true);
//               this.router.navigate(['/onboard']);
//             }
//           },
//           error => {
//             resolve(false);
//         });
//       }
//     });    
//   }
// }