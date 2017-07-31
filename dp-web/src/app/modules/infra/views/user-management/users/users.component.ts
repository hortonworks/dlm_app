import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {UserService} from '../../../../../services/user.service';
import {User, UserList} from '../../../../../models/user';
import {TranslateService} from '@ngx-translate/core';
@Component({
  selector: 'dp-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit {

  users: User[] = [];
  offset = 0;
  pageSize = 10;
  total: number;
  searchTerm;
  rolesMap = new Map();

  constructor(private router: Router,
              private route: ActivatedRoute,
              private userService: UserService,
              private translateService: TranslateService) {
  }

  ngOnInit() {
    this.userService.dataChanged$.subscribe(() => {
      this.getUsers();
    });
    this.getUsers();
  }

  getUsers() {
    this.userService.getUsersWithRole(this.offset, this.pageSize, this.searchTerm).subscribe((userList: UserList) => {
      this.users = userList.users;
      this.total = userList.total;
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

  onSearch(event) {
    if (event.keyCode === 13) {
      this.offset = 0;
      this.getUsers();
    }
  }

  get start() {
    return this.offset + 1;
  }

  onPageSizeChange(pageSize) {
    this.offset = 0;
    this.pageSize = pageSize;
    this.getUsers();
  }

  onPageChange(offset) {
    this.offset = offset - 1;
    this.getUsers();
  }

}
