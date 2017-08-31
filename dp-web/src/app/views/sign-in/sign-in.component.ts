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
import {Subject} from 'rxjs/Rx';

import {Credential} from '../../models/credential';
import {AuthenticationService} from '../../services/authentication.service';
import {ConfigurationService} from '../../services/configuration.service';

@Component({
  selector: 'dp-sign-in',
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.scss']
})
export class SignInComponent implements OnInit {

  _isAuthInProgress = false;
  _isAuthSuccessful = false;
  message = '';
  landingPage:String;

  credential:Credential = new Credential('', '');
  authenticate:Subject<Credential>;

  constructor(private authenticaionService:AuthenticationService,
              private router:Router,
              private configService:ConfigurationService) {
    if (window.location.hash.length > 0 && window.location.hash === '#SESSEXPIRED') {
      this.message = 'SESSIONEXPIRED';
    }
  }

  ngOnInit() {
    let currentLocation = window.location.href.split("/");
    this.landingPage = `${currentLocation[0]}//${currentLocation[2]}`;
  }

  onSubmit(event) {
    this._isAuthInProgress = true;
    this.authenticaionService
      .signIn(this.credential)
      .finally(() => {
        this._isAuthInProgress = false;
      }).subscribe(
      (() => {
        this._isAuthSuccessful = true;
        this.router.navigate(['']);
      }),
      error => {
        this._isAuthSuccessful = false;
        this.message = 'Credentials were incorrect. Please try again.';
      }
    );
  }
}
