import {Component} from '@angular/core';
import { AuthService } from '../services/authservice';
import 'rxjs/add/operator/toPromise';
import { Router } from '@angular/router';
import {LoginData} from '../models/userdata';


@Component({
  selector: 'dp-logout' ,
  template: '../login/login.html'
})

export class LogoutComponent {

  submitted: boolean = false;
  model: LoginData = new LoginData('','','');


  constructor(private userService: AuthService, private router: Router) {
    this.userService.logout();
    this.router.navigate(['ui/login']);
  }

}
