import { Injectable } from '@angular/core';
import { CanActivate, Router} from '@angular/router';

import { AuthenticationService } from '../../services/authentication.service';
import 'rxjs/add/operator/first';


@Injectable()
export class SignedInForSecureGuard implements CanActivate {
  constructor(
    private authenticationService: AuthenticationService,
    private router: Router
  ) {}

  canActivate():Promise<boolean> {
      var isAuthenticated = this.authenticationService.isAuthenticated()
            .then(()=>{ return true})
            .catch(()=>{
                this.router.navigate(['sign-in', {
                cause: 'unauthenticated'
               }]);
              return false;
            });
      return isAuthenticated;

  }
   
}

@Injectable()
export class NotSignedInForUnsecureGuard implements CanActivate {
  constructor(
    private authenticationService: AuthenticationService,
    private router: Router
  ) {}

  canActivate() {
    if(this.authenticationService.isUserLoggedIn()) {
      // check if is first run
      // where to go
      this.router.navigate(['onboard']);
      return true;
    }
    return true;
    //return this.authenticationService.isUserLoggedIn();
  }
}



@Injectable()
export class DoCleanUpAndRedirectGuard implements CanActivate {
  constructor(
    private authenticationService: AuthenticationService,
    private router: Router
  ) {}

  canActivate() {
      this.authenticationService.signOut()
       .then(()=>{ this.router.navigate(['sign-in', {
          cause: 'sign-out'

        }]);
        return true;
       });
      return true;
  }
}
