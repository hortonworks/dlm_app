/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

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
