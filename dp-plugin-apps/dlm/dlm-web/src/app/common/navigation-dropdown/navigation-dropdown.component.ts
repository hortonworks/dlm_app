import { Component, Input, OnInit } from '@angular/core';
import { LinksColumn } from './links-column.type';

@Component({
  selector: 'navigation-dropdown',
  templateUrl: './navigation-dropdown.component.html',
  styleUrls: ['./navigation-dropdown.component.scss']
})
export class NavigationDropdownComponent implements OnInit {

  selectedRole = 'Role1';
  @Input()
  linksColumns: LinksColumn[];
  @Input()
  roles: string[] = ['All Roles', 'Role1', 'Role2', 'Role3'];

  constructor() {
  }

  ngOnInit() {

  }

}
