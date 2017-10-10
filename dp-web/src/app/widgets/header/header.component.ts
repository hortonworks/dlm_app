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

import {Component, Input} from '@angular/core';
import { Router } from '@angular/router';

import {User} from '../../models/user';
import {AuthUtils} from '../../shared/utils/auth-utils';

@Component({
  selector: 'dp-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {

  @Input() user:User;
  signoutURL = AuthUtils.signoutURL;

  constructor(private router: Router) {
  }

  logout() {
    this.router.navigate([AuthUtils.signoutURL]);
  }
}
