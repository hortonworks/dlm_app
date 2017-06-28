import {Component, OnInit} from '@angular/core';
import {LDAPUser} from '../../../../../models/ldap-user';
import {UserService} from '../../../../../services/user.service';
import {ActivatedRoute, Router} from '@angular/router';
import {TagTheme} from '../../../../../shared/tagging-widget/tagging-widget.component';
import {User} from '../../../../../models/user';

@Component({
  selector: 'dp-add-user',
  templateUrl: './add-user.component.html',
  styleUrls: ['./add-user.component.scss']
})
export class AddUserComponent implements OnInit {
  users: string[] = [];
  roles: string[] = [];
  modes = Modes;
  mode = Modes.ADD;
  userName: string;

  availableUsers: string[] = [];
  availableRoles: string[] = [];

  allRoles: string[] = [];

  tagTheme = TagTheme;
  user: User = new User('', '', '', '', [], false, '');

  constructor(private userService: UserService, private router: Router, private route: ActivatedRoute) {
  }

  ngOnInit() {
    this.userName = this.route.snapshot.params['name'];
    if (this.userName) {
      this.mode = Modes.EDIT;
      this.userService.getUserByName(this.userName).subscribe(user => this.user = user);
    }
    this.userService.getAllRoles().subscribe(roles => {
      this.allRoles = roles.map(role => {
        return role.roleName;
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

  onNewRoleAddition(text: string) {
    this.roles.push(text);
  }

  onRolesEdit(text: string) {
    this.user.roles.push(text);
  }

  onRoleSearchChange(text: string) {
    this.availableRoles = [];
    if (text && text.length > 2) {
      this.availableRoles = this.allRoles.filter(role => {
        return role.toLowerCase().startsWith(text.toLowerCase());
      });
    }
  }

  save() {
    if (this.mode as Modes === Modes.EDIT) {
      this.userService.updateUser(this.user).subscribe(user => {
        this.userService.dataChanged.next();
        this.router.navigate(['/infra/users']);
      }, error => {
        console.error('error')
      });
    } else {
      this.userService.addUsers(this.users, this.roles).subscribe(response => {
        this.userService.dataChanged.next();
        this.router.navigate(['/infra/users']);
      }, error => {
        console.error('error')
      });
    }
  }

  back() {
    this.router.navigate(['/infra/users']);
  }
}

export enum Modes {
  ADD,
  EDIT
}