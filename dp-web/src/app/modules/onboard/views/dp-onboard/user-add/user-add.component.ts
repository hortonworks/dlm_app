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
import {ActivatedRoute, Router} from '@angular/router';
import {UserService} from '../../../../../services/user.service';
import {LDAPUser} from '../../../../../models/ldap-user';
import {TagTheme} from '../../../../../shared/tagging-widget/tagging-widget.component';
import {AuthenticationService} from '../../../../../services/authentication.service';
import {Observable} from 'rxjs/Observable';
import {GroupService} from '../../../../../services/group.service';

@Component({
  selector: 'dp-user-add',
  templateUrl: './user-add.component.html',
  styleUrls: ['./user-add.component.scss', '../dp-onboard.component.scss']
})
export class UserAddComponent implements OnInit {

  showNotification = false;
  users: string[] = [];
  groups: string[] = [];
  availableUsers: string[] = [];
  availableGroups: string[] = [];
  tagThemes = TagTheme;
  groupsSaved = false;
  usersSaved = false;

  constructor(private route: ActivatedRoute,
              private router: Router,
              private userService: UserService,
              private groupService: GroupService,
              private authenticationService: AuthenticationService) {
  }

  ngOnInit() {
    this.showNotification = true;
  }

  ngAfterViewInit() {
    setTimeout(() => {
      let element: any = document.querySelector('#users-tags').querySelector('.taggingWidget');
      element.click();
    }, 500);
  }

  closeNotification() {
    this.showNotification = false;
  }

  save() {
    if (!this.groupsSaved && !this.usersSaved) {
      this.saveUsersAndGroups().subscribe(res => {
        this.groupsSaved = res.groupsAdditionSuccess;
        this.usersSaved = res.userAdditionSuccess;
        if (res.groupsAdditionSuccess && res.userAdditionSuccess) {
          this.authenticationService.signOut();
        }
      });
    } else if (!this.usersSaved && this.groupsSaved) {
      this.userService.addAdminUsers(this.users).subscribe(response => {
        this.usersSaved = true;
        this.authenticationService.signOut();
      }, (error) => {
        console.error(error);
        this.usersSaved = false;
      });
    } else if (this.usersSaved && !this.groupsSaved) {
      this.groupService.addAdminGroups(this.groups).subscribe(response => {
        this.groupsSaved = true;
        this.authenticationService.signOut();
      }, (error) => {
        console.error(error);
        this.groupsSaved = false;
      });
    }
  }

  saveUsersAndGroups() {
    return Observable.forkJoin(
      this.userService.addAdminUsers(this.users),
      this.groupService.addAdminGroups(this.groups)
    ).map(responses => {
      console.log(responses);
      return {
        userAdditionSuccess: this.users.length === responses[0].successfullyAdded.length,
        groupsAdditionSuccess: this.groups.length === responses[1].successfullyAdded.length
      };
    });
  }

  back() {
    this.router.navigate(['/onboard/configure']);
  }

  onNewUserAddition(text: string) {
    this.users.push(text);
  }

  onNewGroupAddition(text: string) {
    this.groups.push(text);
  }

  onUserSearchChange(text: string) {
    this.availableUsers = [];
    if (text && text.length > 2) {
      this.userService.searchLDAPUsers(text).subscribe((ldapUsers: LDAPUser[]) => {
        this.availableUsers = [];
        ldapUsers.map(user => {
          this.availableUsers.push(user.name);
        });
      }, () => {
        console.error('Error while fetching ldap users');
      });
    }
  }

  onGroupSearchChange(text: string) {
    this.availableGroups = [];
    if (text && text.length > 2) {
      this.userService.searchLDAPGroups(text).subscribe((ldapGroups: any[]) => {
        this.availableGroups = [];
        ldapGroups.map(group => {
          this.availableGroups.push(group.name);
        });
      }, () => {
        console.error('Error while fetching ldap groups');
      });
    }
  }

}
