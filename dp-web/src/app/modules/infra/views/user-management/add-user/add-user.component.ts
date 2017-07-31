import {Component, OnInit} from '@angular/core';
import {LDAPUser} from '../../../../../models/ldap-user';
import {UserService} from '../../../../../services/user.service';
import {ActivatedRoute, Router} from '@angular/router';
import {TaggingWidgetTagModel, TagTheme} from '../../../../../shared/tagging-widget/tagging-widget.component';
import {User} from '../../../../../models/user';
import {TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'dp-add-user',
  templateUrl: './add-user.component.html',
  styleUrls: ['./add-user.component.scss']
})
export class AddUserComponent implements OnInit {
  users: string[] = [];
  roles: TaggingWidgetTagModel[] = [];
  modes = Modes;
  mode = Modes.ADD;
  userName: string;

  availableUsers: string[] = [];
  availableRoles: TaggingWidgetTagModel[] = [];

  allRoles: TaggingWidgetTagModel[] = [];

  tagTheme = TagTheme;
  user: User = new User('', '', '', '', [], false, '');
  userRoles: TaggingWidgetTagModel[] = [];

  constructor(private userService: UserService, private router: Router, private route: ActivatedRoute, private translateService: TranslateService) {
  }

  ngOnInit() {
    this.userName = this.route.snapshot.params['name'];
    if (this.userName) {
      this.mode = Modes.EDIT;
      this.userService.getUserByName(this.userName).subscribe(user => {
        this.user = user;
        let roles = [];
        this.user.roles.forEach(role =>{
          this.userRoles.push(new TaggingWidgetTagModel(this.translateService.instant(`common.roles.${role}`), role));
        });
      });
    }
    this.userService.getAllRoles().subscribe(roles => {
      this.allRoles = roles.map(role => {
        return new TaggingWidgetTagModel(this.translateService.instant(`common.roles.${role.roleName}`),role.roleName);
      })
    });
  }

  onNewUserAddition(text: string) {
    this.users.push(text);
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

  onNewRoleAddition(tag: TaggingWidgetTagModel) {
    this.roles.push(tag);
  }

  onRolesEdit(tag: TaggingWidgetTagModel) {
    this.userRoles.push(tag);
  }

  onRoleSearchChange(text: string) {
    this.availableRoles = [];
    if (text && text.length > 2) {
      this.availableRoles = this.allRoles.filter(role => {
        return role.display.toLowerCase().startsWith(text.toLowerCase());
      });
    }
  }

  save() {
    if (this.mode as Modes === Modes.EDIT) {
      this.user.roles = this.userRoles.map(role => {
        return role.data
      });
      this.userService.updateUser(this.user).subscribe(user => {
        this.userService.dataChanged.next();
        this.router.navigate(['users'], {relativeTo: this.route});
      }, error => {
        console.error('error')
      });
    } else {
      let roles = this.roles.map(role => {
        return role.data;
      });
      this.userService.addUsers(this.users, roles).subscribe(response => {
        this.userService.dataChanged.next();
        this.router.navigate(['users'], {relativeTo: this.route});
      }, error => {
        console.error('error')
      });
    }
  }

  back() {
    this.router.navigate(['users'], {relativeTo: this.route});
  }
}

export enum Modes {
  ADD,
  EDIT
}
