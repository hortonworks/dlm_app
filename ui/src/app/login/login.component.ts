import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { Credential } from '../models/credential';
import { AuthenticationService } from '../services/authentication.service';
import { BreadcrumbService } from '../services/breadcrumb.service';
import { Environment } from '../environment';
import { Persona } from '../shared/utils/persona';


@Component({
  selector: 'dp-login' ,
  templateUrl: 'login.component.html',
  styleUrls: ['login.component.css']
})

export class LoginComponent {

  statusMessage: string = '';
  submitted: boolean = false;
  credential: Credential = new Credential('','');

  constructor(private authenticaionService: AuthenticationService, private router: Router, private environment: Environment, private breadcrumbService: BreadcrumbService) {
    if (window.location.hash.length > 0 && window.location.hash === '#SESSEXPIRED') {
      this.statusMessage = 'SESSIONEXPIRED';
    }
  }

  onSubmit() {
    this.submitted = true;
    this.breadcrumbService.crumbMap = [];
    this.authenticaionService.signIn(this.credential)
      .subscribe(
        user => {
          const persona = Persona[user.roles[0]];
          this.environment.persona = persona;

          if (persona === Persona.ANALYSTADMIN) {
            this.environment.DATA_CENTER_DATA_LAKE = 'DATA LAKE';
            this.router.navigate(['data-analyst/analyst-dashboard']);
          } else {
            this.environment.DATA_CENTER_DATA_LAKE = 'DATA CENTER';
            this.router.navigate(['dashboard']);
          }
        },
        error => this.router.navigate(['login'])
      );
  }
}
