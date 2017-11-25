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

import {Router, ActivatedRoute, Params} from '@angular/router';
import {Subject} from 'rxjs/Rx';

import {Credential} from '../../models/credential';
import {AuthenticationService} from '../../services/authentication.service';
import {ConfigurationService} from '../../services/configuration.service';
import {TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'dp-sign-in',
  templateUrl: './sign-in.component.html',
  styleUrls: ['./sign-in.component.scss']
})
export class SignInComponent implements OnInit {

  _isAuthInProgress = false;
  _isAuthSuccessful = false;
  message = '';
  landingPage: String;

  credential: Credential = new Credential('', '');
  authenticate: Subject<Credential>;
  originalUrl = '/';

  constructor(private authenticaionService: AuthenticationService,
              private router: Router,
              private activatedRoute: ActivatedRoute,
              private configService: ConfigurationService,
              private translateService: TranslateService) {
    if (window.location.hash.length > 0 && window.location.hash === '#SESSEXPIRED') {
      this.message = 'SESSIONEXPIRED';
    }
  }

  ngOnInit() {
    let currentLocation = window.location.href.split('/');
    this.landingPage = `${currentLocation[0]}//${currentLocation[2]}`;

    this.activatedRoute
      .queryParams
      .subscribe((params: Params) => {
        const originalUrl = params['originalUrl'] ? params['originalUrl'] : `${window.location.protocol}//${window.location.host}/`;
        this.originalUrl = originalUrl.substring(`${window.location.protocol}//${window.location.host}`.length);
      });
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
        this.router.navigate([this.originalUrl]);
      }),
      error => {
        if (error.status === 401) {
          this.message = this.translateService.instant("pages.signin.description.invalidCredentials");
        }else{
          this.message = this.translateService.instant("pages.signin.description.systemError");
        }
        this._isAuthSuccessful = false;
      }
    );
  }
}
