import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';

@Component({
  selector: 'dp-user-management',
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.scss']
})
export class UserManagementComponent implements OnInit {

  views = Views;
  currentView: Views;

  constructor(private router: Router, private route: ActivatedRoute) {
  }

  ngOnInit() {
    if (this.router.url.indexOf('/users') > -1) {
      this.currentView = Views.USERS;
    } else if (this.router.url.indexOf('/groups') > -1) {
      this.currentView = Views.GROUPS;
    }
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

}

export enum Views {
  USERS,
  GROUPS
}
