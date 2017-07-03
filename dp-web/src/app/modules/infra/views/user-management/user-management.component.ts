import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {UserService} from '../../../../services/user.service';
import {User} from '../../../../models/user';
import {TranslateService} from '@ngx-translate/core';

@Component({
  selector: 'dp-user-management',
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.scss']
})
export class UserManagementComponent implements OnInit {

  users: User[] = [];
  rolesMap = new Map();

  constructor(private router: Router, private route: ActivatedRoute, private userService: UserService, private translateService: TranslateService) {
  }

  ngOnInit() {
    this.userService.dataChanged$.subscribe(() => {
      this.getUsers();
    });
    this.getUsers();
  }

  getUsers() {
    this.userService.getUsersWithRole().subscribe(users => {
      this.users = users
      this.users.forEach(user => {
        let roles = [];
        user.roles.forEach(role => {
          roles.push(this.translateService.instant(`common.roles.${role}`));
        });
        this.rolesMap.set(user.id, roles.join(', '));
      });
    });
  }

  addUser() {
    this.router.navigate([{outlets: {'sidebar': ['add']}}], {relativeTo: this.route});
  }

  editUser(userName) {
    this.router.navigate([{outlets: {'sidebar': ['edit', userName]}}], {relativeTo: this.route});
  }

}
