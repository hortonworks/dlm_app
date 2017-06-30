import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {UserService} from '../../../../services/user.service';
import {User, UserList} from '../../../../models/user';

@Component({
  selector: 'dp-user-management',
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.scss']
})
export class UserManagementComponent implements OnInit {
  users: User[] = [];
  offset = 0;
  pageSize = 10;
  total: number;
  searchTerm;

  constructor(private router: Router, private route: ActivatedRoute, private userService: UserService) {
  }

  ngOnInit() {
    this.userService.dataChanged$.subscribe(() => {
      this.getUsers();
    });
    this.getUsers();
  }

  getUsers(){
    this.userService.getUsersWithRole(this.offset, this.pageSize, this.searchTerm).subscribe((userList: UserList) => {
      this.users = userList.users;
      this.total = userList.total;
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

  get start(){
    return this.offset + 1;
  }

  onPageSizeChange(pageSize){
    this.offset = 0;
    this.pageSize = pageSize;
    this.getUsers();
  }

  onPageChange(offset){
    this.offset = offset - 1;
    this.getUsers();
  }

}
