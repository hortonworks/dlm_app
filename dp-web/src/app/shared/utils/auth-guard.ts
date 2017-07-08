import { Injectable } from '@angular/core';
import { CanActivate, Router} from '@angular/router';

import { AuthenticationService } from '../../services/authentication.service';
import 'rxjs/add/operator/first';
import {Observable} from 'rxjs/Observable';


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
        this.authenticationService.redirectToSignIn();
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
      this.router.navigate(['']);
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
      return this.authenticationService.signOut()
       .then(()=>{
        this.authenticationService.redirectToSignIn();
        return true;
       });
    }
}
