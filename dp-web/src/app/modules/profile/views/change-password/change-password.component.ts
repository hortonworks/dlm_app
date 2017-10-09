/*
 *
 *  * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *  *
 *  * Except as expressly permitted in a written agreement between you or your company
 *  * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 *  * reproduction, modification, redistribution, sharing, lending or other exploitation
 *  * of all or any part of the contents of this software is strictly prohibited.
 *
 */

import {Component} from '@angular/core';
import {Router} from '@angular/router';
import {FormGroup, FormControl, Validators, ValidatorFn} from '@angular/forms';
import {Observable} from 'rxjs/Rx';

import {IdentityService} from '../../../../services/identity.service';
import {AuthUtils} from '../../../../shared/utils/auth-utils';

@Component({
  selector: 'dp-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss']
})
export class ChangePasswordComponent {

  form: FormGroup;

  passwordCurrent: string;
  passwordNew: string;
  passwordNewConfirm: string;

  serverError: string;

  constructor(
    private router: Router,
    private identityService: IdentityService,
  ) {
    this.form = new FormGroup({
        'passwordCurrent': new FormControl(this.passwordCurrent, [
          Validators.required,
        ]),
        'passwordNew': new FormControl(this.passwordNew, [
          Validators.required,
        ]),
        'passwordNewConfirm': new FormControl(this.passwordNewConfirm, [
          Validators.required,
        ])
      },
      (group: FormGroup) => {
        if(group.controls['passwordNew'].value !== group.controls['passwordNewConfirm'].value) {
          return ({ noMatch : true });
        }
        return ({});
      }
    );
  }

  onSubmit() {
    if(this.form.valid === false) {
      // do nothing
    } else {
      this.identityService
        .changePassword(this.passwordCurrent, this.passwordNew)
        .subscribe(
          () => {
            AuthUtils.clearUser();
            window.location.href = AuthUtils.signoutURL;
          },
          error => this.serverError = error
        );
    }
  }

}
