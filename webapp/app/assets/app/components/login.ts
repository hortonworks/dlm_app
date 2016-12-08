import {Component} from '@angular/core';
import {LoginData} from '../models/userdata';
import { AuthService } from '../services/authservice';
import 'rxjs/add/operator/toPromise';
import { Router } from '@angular/router';


@Component({
    selector: 'dp-login' ,
    templateUrl: 'assets/app/components/login.html',
    styleUrls: ['assets/app/components/login.css']
})

export default class LoginComponent {

    statusMessage: string = '';
    submitted: boolean = false;
    model: LoginData = new LoginData('','');

    constructor(private userService: AuthService, private router: Router) {
        if (window.location.hash.length > 0 && window.location.hash === '#SESSEXPIRED') {
            this.statusMessage = 'SESSIONEXPIRED';
        }

    }

    onSubmit() {
        this.submitted = true;
        this.userService.login(this.model.name, this.model.password).then(res=> this.router.navigate(['ui/dashboard']))
            .catch(error => this.router.navigate(['ui/login']));
    }
}
