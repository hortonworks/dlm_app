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
    this.currentView = Views.USERS;
    this.onViewChange(this.currentView)
  }

  onViewChange(view){
    this.currentView = view;
    if(this.currentView === Views.GROUPS){
      this.router.navigate(['groups'], {relativeTo: this.route});
    }else {
      this.router.navigate(['users'], {relativeTo: this.route});
    }
  }

}

export enum Views {
  USERS,
  GROUPS
}
