import { Component } from '@angular/core';
import { Router } from '@angular/router';

import { Credential } from '../../models/credential';
import { AuthenticationService } from '../../services/authentication.service';
import { Environment } from '../../environment';
import { Persona } from '../../shared/utils/persona';

@Component({
  selector: 'dp-sign-in',
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.scss']
})
export class SignInComponent {

  _isAuthInProgress = false;
  _isAuthSuccessful = false;
  message = '';

  credential: Credential = new Credential('','');

  constructor(
    private authenticaionService: AuthenticationService,
    private router: Router,
    private environment: Environment,
  ) {
    if (window.location.hash.length > 0 && window.location.hash === '#SESSEXPIRED') {
      this.message = 'SESSIONEXPIRED';
    }
  }

  onSubmit(event) {
    this._isAuthInProgress = true;

    this.authenticaionService
      .signIn(this.credential)
      .finally(() => {
        this._isAuthInProgress = false;
      })
      .subscribe(
        user => {
          const persona = Persona[user.roles[0]];
          // this.environment.persona = persona;

          this._isAuthSuccessful = true;
          // TODO: check if is first run
          // this.lakeService.list()
          this.router.navigate(['onboard']);
        },
        error => {
          this._isAuthSuccessful = false;
          this.message = 'Credentials were incorrect. Please try again.';
        }
      );
  }

}
