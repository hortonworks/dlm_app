import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { Credential } from '../../models/credential';
import { AuthenticationService } from '../../services/authentication.service';
import { BreadcrumbService } from '../../services/breadcrumb.service';
import { Environment } from '../../environment';
import { Persona } from '../../shared/utils/persona';

@Component({
  selector: 'dp-sign-in',
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.scss']
})
export class SignInComponent {

  statusMessage: string = '';
  submitted: boolean = false;
  credential: Credential = new Credential('','');

  constructor(
    private authenticaionService: AuthenticationService,
    private router: Router,
    private environment: Environment,
    private breadcrumbService: BreadcrumbService
  ) {
    if (window.location.hash.length > 0 && window.location.hash === '#SESSEXPIRED') {
      this.statusMessage = 'SESSIONEXPIRED';
    }
  }

  onSubmit() {
    this.submitted = true;
    this.breadcrumbService.crumbMap = [];
    this.authenticaionService
      .signIn(this.credential)
      .subscribe(
        user => {
          const persona = Persona[user.roles[0]];
          this.environment.persona = persona;
          // TODO: check if is first run
          this.router.navigate(['first-run']);
        },
        error => this.router.navigate(['sign-in'])
      );
  }

}
