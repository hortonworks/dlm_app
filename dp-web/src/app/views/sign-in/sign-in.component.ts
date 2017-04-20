import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs/Rx';

import { Credential } from '../../models/credential';
import { AuthenticationService } from '../../services/authentication.service';
import { ConfigurationService } from '../../services/configuration.service';

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
  authenticate: Subject<Credential>;

  constructor(
    private authenticaionService: AuthenticationService,
    private router: Router,
    private configService: ConfigurationService,
  ) {
    if (window.location.hash.length > 0 && window.location.hash === '#SESSEXPIRED') {
      this.message = 'SESSIONEXPIRED';
    }

    // this.authenticate
    //   .flatMap(credential => this.authenticaionService.signIn(credential))
    //   .subscribe()
  }

  onSubmit(event) {
    this._isAuthInProgress = true;

    this.authenticaionService
      .signIn(this.credential)
      .finally(() => {
        this._isAuthInProgress = false;
      })
      .flatMap(user => this.configService.retrieve())
      .subscribe(
        ({lakeWasInitialized}) => {
          // const persona = Persona[user.roles[0]];

          this._isAuthSuccessful = true;

          if(lakeWasInitialized) {
            this.router.navigate(['/infra']);
          } else {
            this.router.navigate(['/onboard']);
          }
        },
        error => {
          this._isAuthSuccessful = false;
          this.message = 'Credentials were incorrect. Please try again.';
        }
      );
  }

}
