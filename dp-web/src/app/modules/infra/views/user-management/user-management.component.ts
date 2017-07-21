import {Component, OnInit} from '@angular/core';

@Component({
  selector: 'dp-user-management',
  templateUrl: './user-management.component.html',
  styleUrls: ['./user-management.component.scss']
})
export class UserManagementComponent implements OnInit {

  views = Views;
  currentView: Views;

  constructor() {
  }

  ngOnInit() {
    this.currentView = Views.USERS
  }

  onViewChange(view){
    this.currentView = view;
  }

}

export enum Views {
  USERS,
  GROUPS
}
