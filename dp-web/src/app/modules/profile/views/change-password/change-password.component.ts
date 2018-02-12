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
import {AuthenticationService} from '../../../../services/authentication.service';

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
    private authenticationService: AuthenticationService
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
            this.authenticationService
              .signOutAndRedirect();
          },
          error => {
            if (error._body) {
              let errorJSON = JSON.parse(error._body);
              if(Array.isArray(errorJSON.errors) && errorJSON.errors[0] && errorJSON.errors[0].status && errorJSON.errors[0].errorType){
                this.serverError = errorJSON.errors.filter(err => {return (err.status && err.errorType)}).map(err => {return err.message}).join(', ');
              } else if(errorJSON.message){
                this.serverError = errorJSON.message
              } else if (errorJSON.errors){
                this.serverError = errorJSON.errors.map(err => {return err.message}).join(', ')
              } else {
                this.serverError = error;
              }
            }
          }
        );
    }
  }

}
