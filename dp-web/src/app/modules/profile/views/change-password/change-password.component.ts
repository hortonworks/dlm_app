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

import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {FormGroup, FormControl, Validators, ValidatorFn} from '@angular/forms';
import {Observable} from 'rxjs/Rx';

import {UserService} from '../../../../services/user.service';

@Component({
  selector: 'dp-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss']
})
export class ChangePasswordComponent implements OnInit {

  form: FormGroup;

  passwordCurrent: string;
  passwordNew: string;
  passwordNewConfirm: string;

  constructor(
    private router: Router,
    private userService: UserService,
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
      (group: FormGroup) => ({
          isValid: group.controls['passwordNew'].value === group.controls['passwordNewConfirm'].value
      })
    );
  }

  ngOnInit() {

  }

}
