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
    this.route.params.subscribe(params => {
      if (params.status && params.status === 'success') {
        this.showNotification = true;
      }
    });
  }

  closeNotification() {
    this.showNotification = false;
  }

  save() {
    if (!this.groupsSaved && !this.usersSaved) {
      this.saveUsersAndGroups().subscribe(res => {
        this.groupsSaved = res.groupsAddtionSuccess;
        this.usersSaved = res.userAdditionSuccess;
        if (res.groupsAddtionSuccess && res.userAdditionSuccess) {
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
        this.usersSaved = false;
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
        userAdditionSuccess: this.users.length === responses[0].length,
        groupsAddtionSuccess: this.groups.length === responses[1].length
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
