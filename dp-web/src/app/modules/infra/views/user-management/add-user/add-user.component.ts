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

import {AfterViewInit, Component, HostListener, OnInit, ViewChild} from '@angular/core';
import {LDAPUser} from '../../../../../models/ldap-user';
import {UserService} from '../../../../../services/user.service';
import {ActivatedRoute, Router} from '@angular/router';
import {TaggingWidget, TaggingWidgetTagModel, TagTheme} from '../../../../../shared/tagging-widget/tagging-widget.component';
import {User} from '../../../../../models/user';
import {TranslateService} from '@ngx-translate/core';
import {NgForm} from '@angular/forms';

@Component({
  selector: 'dp-add-user',
  templateUrl: './add-user.component.html',
  styleUrls: ['./add-user.component.scss']
})
export class AddUserComponent implements OnInit, AfterViewInit {
  users: string[] = [];
  roles: TaggingWidgetTagModel[] = [];
  modes = Modes;
  mode = Modes.ADD;
  userName: string;
  showRoles = false;

  availableUsers: string[] = [];
  availableRoles: TaggingWidgetTagModel[] = [];

  allRoles: TaggingWidgetTagModel[] = [];

  tagTheme = TagTheme;
  user: User = new User('', '', '', '', [], false, '');
  userRoles: TaggingWidgetTagModel[] = [];

  errorMessages: string[] = [];
  showError = false;
  duplicateRole: string;

  @ViewChild('addUserForm') addUserForm: NgForm;
  @ViewChild('editUserForm') editUserForm: NgForm;
  @ViewChild('userTags') private userTags: TaggingWidget;
  @ViewChild('roleTags') private roleTags: TaggingWidget;

  constructor(private userService: UserService,
              private router: Router,
              private route: ActivatedRoute,
              private translateService: TranslateService) {
  }

  @HostListener('click', ['$event', '$event.target'])
  public onClick($event: MouseEvent, targetElement: HTMLElement): void {
    let optionList = targetElement.querySelector('.option-list');
    if (optionList) {
      this.showRoles = false;
    }
  }

  ngOnInit() {
    this.userName = this.route.snapshot.params['name'];
    if (this.userName) {
      this.mode = Modes.EDIT;
      this.userService.getUserByName(this.userName).subscribe(user => {
        this.user = user;
        let roles = [];
        this.user.roles.forEach(role => {
          this.userRoles.push(new TaggingWidgetTagModel(this.translateService.instant(`common.roles.${role}`), role));
        });
      });
    }
    this.userService.getAllRoles().subscribe(roles => {
      this.allRoles = roles.map(role => {
        return new TaggingWidgetTagModel(this.translateService.instant(`common.roles.${role.roleName}`), role.roleName);
      })
    });
  }

  ngAfterViewInit() {
    setTimeout(() => {
      let element: any = this.mode as Modes === Modes.EDIT ?
        document.querySelector('#role-tags').querySelector('.taggingWidget') :
        document.querySelector('#user-tags').querySelector('.taggingWidget');
      element.click();
    }, 500);
  }

  onNewUserAddition(user: string) {
    if (this.users.find(usr => usr === user)) {
      this.showWarning(`${this.translateService.instant('pages.infra.labels.duplicateUser')}${user}`, document.getElementById('duplicate-user-warning'));
      return;
    }
    this.users.push(user);
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
        this.onError(this.translateService.instant('pages.infra.description.ldapError'));
      });
    }
  }

  onNewRoleAddition(tag: TaggingWidgetTagModel) {
    if (this.roles.find(role => role.data === tag.data)) {
      this.showWarning(`${this.translateService.instant('pages.infra.labels.duplicateRole')}${tag.display}`, document.getElementById('duplicate-role-warning'));
      return;
    }
    this.roles.push(tag);
  }

  onRolesEdit(tag: TaggingWidgetTagModel) {
    if (this.userRoles.find(role => role.data === tag.data)) {
      this.showWarning(`${this.translateService.instant('pages.infra.labels.duplicateRole')}${tag.display}`, document.getElementById('duplicate-role-warning'));
      return;
    }
    this.userRoles.push(tag);
  }

  private showWarning(message, element) {
    element.innerHTML = message;
    element.style.display = 'block';
    element.style.opacity = 1;
    setTimeout(() => {
      let opacity = 1;
      let fade = setInterval(() => {
        opacity -= 0.3;
        element.style.opacity = opacity;
        if (opacity <= 0) {
          clearInterval(fade);
          element.style.display = 'none';
        }
      }, 100);
    }, 1000);
  }

  onRoleSearchChange(text: string) {
    this.showRoles = false;
    this.availableRoles = [];
    if (text && text.length > 2) {
      this.availableRoles = this.allRoles.filter(role => {
        return role.display.toLowerCase().startsWith(text.toLowerCase());
      });
    }
  }

  showRoleOptions() {
    this.showRoles = !this.showRoles;
  }

  save() {
    this.clearErrors();
    if (this.mode as Modes === Modes.EDIT && this.isEditDataValid()) {
      this.user.roles = this.userRoles.map(role => {
        return role.data
      });
      this.userService.updateUser(this.user).subscribe(user => {
        this.userService.dataChanged.next();
        this.router.navigate(['users'], {relativeTo: this.route});
      }, error => {
        this.onError(this.translateService.instant('pages.infra.description.updateUserError'));
      });
    } else if (this.mode as Modes === Modes.ADD && this.isCreateDataValid()) {
      let roles = this.roles.map(role => {
        return role.data;
      });
      this.userService.addUsers(this.users, roles).subscribe(response => {
        if (response.successfullyAdded.length === this.users.length) {
          this.userService.dataChanged.next();
          this.router.navigate(['users'], {relativeTo: this.route});
        } else {
          let failedUsers = [];
          this.users.forEach(user => {
            if (!response.successfullyAdded.find(res => res.userName === user)) {
              failedUsers.push(user)
            }
          });
          this.userService.dataChanged.next();
          this.onError(`${this.translateService.instant('pages.infra.description.addUserError')} - ${failedUsers.join(', ')}`);
        }

      }, error => {
        this.onError(this.translateService.instant('pages.infra.description.addUserError'));
      });
    }
  }

  clearErrors() {
    this.showError = false;
    this.errorMessages = []
  }

  isEditDataValid() {
    let valid = true;
    if (this.userRoles.length === 0 || !this.editUserForm.form.valid) {
      this.onError(this.translateService.instant('common.defaultRequiredFields'));
      valid = false;
    } else if (!this.roleTags.isValid) {
      this.onError(this.translateService.instant('pages.infra.description.invalidRoleInput'));
      valid = false;
    }
    return valid;
  }

  isCreateDataValid() {
    let valid = true;
    if (this.roles.length === 0 || !this.addUserForm.form.valid) {
      this.onError(this.translateService.instant('common.defaultRequiredFields'));
      valid = false;
    }
    if (!this.roleTags.isValid) {
      this.onError(this.translateService.instant('pages.infra.description.invalidRoleInput'));
      valid = false;
    }
    if (!this.userTags.isValid) {
      this.onError(this.translateService.instant('pages.infra.description.invalidUserInput'));
      valid = false;
    }
    return valid;
  }

  onError(errorMessage) {
    this.errorMessages.push(errorMessage);
    this.showError = true;
  }

  back() {
    this.router.navigate(['users'], {relativeTo: this.route});
  }
}

export enum Modes {
  ADD,
  EDIT
}
