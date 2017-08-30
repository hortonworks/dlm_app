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

import {Component, DoCheck, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';

@Component({
  selector: 'dp-user-management',
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.scss']
})
export class UserManagementComponent implements OnInit, DoCheck {

  views = Views;
  currentView: Views;

  constructor(private router: Router, private route: ActivatedRoute) {
  }

  ngOnInit() {
    this.setView();
    this.router.navigateByUrl(this.router.url);
  }

  onViewChange(view) {
    this.currentView = view;
    if (this.currentView === Views.GROUPS) {
      this.router.navigate(['groups'], {relativeTo: this.route});
    } else {
      this.router.navigate(['users'], {relativeTo: this.route});
    }
  }

  setView() {
    if (this.router.url.indexOf('/users') > -1 && this.currentView !== Views.USERS) {
      this.currentView = Views.USERS;
    } else if (this.router.url.indexOf('/groups') > -1 && this.currentView !== Views.GROUPS) {
      this.currentView = Views.GROUPS;
    }
  }

  ngDoCheck() {
    this.setView();
  }

}

export enum Views {
  USERS,
  GROUPS
}
