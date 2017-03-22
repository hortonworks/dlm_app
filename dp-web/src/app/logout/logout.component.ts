import {Component} from '@angular/core';
import { AuthenticationService } from '../services/authentication.service';
import { Router } from '@angular/router';


@Component({
  selector: 'dp-logout' ,
  template: '../login/login.html'
})

export class LogoutComponent {
  constructor(
    private authenticationService: AuthenticationService,
    private router: Router
  ) {
    this.authenticationService.signOut();
    this.router.navigate(['sign-in']);
  }

}
