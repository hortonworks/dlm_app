import {Component} from '@angular/core';
import {LoginData} from '../models/userdata';
import { AuthService } from '../services/authservice';
import { Router } from '@angular/router';
import {Environment} from '../environment';
import {Persona} from '../shared/utils/persona';
import 'rxjs/add/operator/toPromise';
import {BreadcrumbService} from '../services/breadcrumb.service';


@Component({
    selector: 'dp-login' ,
    templateUrl: 'assets/app/components/login.html',
    styleUrls: ['assets/app/components/login.css']
})

export default class LoginComponent {

    statusMessage: string = '';
    submitted: boolean = false;
    model: LoginData = new LoginData('','', '');

    constructor(private userService: AuthService, private router: Router, private environment: Environment, private breadcrumbService: BreadcrumbService) {
        if (window.location.hash.length > 0 && window.location.hash === '#SESSEXPIRED') {
            this.statusMessage = 'SESSIONEXPIRED';
        }
    }

    onSubmit() {
        this.submitted = true;
        this.breadcrumbService.crumbMap = [];
        this.userService.login(this.model.name, this.model.password).then(res=> {
            const persona = Persona[res.userType];
            this.environment.persona = persona;

            if (persona === Persona.ANALYSTADMIN) {
                this.environment.DATA_CENTER_DATA_LAKE = 'Data Lake';
                this.router.navigate(['ui/data-analyst/analyst-dashboard']);
            } else {
                this.environment.DATA_CENTER_DATA_LAKE = 'Data Center';
                this.router.navigate(['ui/dashboard']);
            }
        }).catch(error => this.router.navigate(['ui/login']));
    }
}
