/*
 *
 *  * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *  *
 *  * Except as expressly permitted in a written agreement between you or your company
 *  * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 *  * reproduction, modification, redistribution, sharing, lending or other exploitation
 *  * of all or any part of the contents of this software is strictly prohibited.
 *
 */

import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {GroupService} from '../../../../../services/group.service';
import {TranslateService} from '@ngx-translate/core';
import {Group, GroupList} from '../../../../../models/group';
import {TabStyleType} from '../../../../../shared/tabs/tabs.component';
@Component({
  selector: 'dp-groups',
  templateUrl: './groups.component.html',
  styleUrls: ['./groups.component.scss']
})
export class GroupsComponent implements OnInit {

  tabType = TabStyleType;
  tabs = UserMgmtTabs;

  groups: Group[] = [];
  offset = 0;
  pageSize = 10;
  total: number;
  searchTerm;
  rolesMap = new Map();

  constructor(private router: Router,
              private route: ActivatedRoute,
              private groupService: GroupService,
              private translateService: TranslateService) {
  }

  ngOnInit() {
    this.groupService.dataChanged$.subscribe(() => {
      this.getGroups();
    });
    this.getGroups();
  }

  getGroups() {
    this.groupService.getAllGroups(this.offset, this.pageSize, this.searchTerm).subscribe((groupList: GroupList) => {
      this.groups = groupList.groups;
      this.total = groupList.total;
      this.groups.forEach(group => {
        let roles = [];
        group.roles.forEach(role => {
          roles.push(this.translateService.instant(`common.roles.${role}`));
        });
        this.rolesMap.set(group.id, roles.join(', '));
      });
    });
  }

  addGroup() {
    this.router.navigate([{outlets: {'sidebar': ['add']}}], {relativeTo: this.route});
  }

  editGroup(groupName) {
    this.router.navigate([{outlets: {'sidebar': [groupName, 'edit']}}], {relativeTo: this.route});
  }

  onSearch(event) {
    this.offset = 0;
    this.getGroups();
  }

  switchView(tab) {
    if (tab === UserMgmtTabs.USERS) {
      this.router.navigate(['/infra/manage-access/users']);
    }
  }

  get start() {
    return this.offset + 1;
  }

  onPageSizeChange(pageSize) {
    this.offset = 0;
    this.pageSize = pageSize;
    this.getGroups();
  }

  onPageChange(offset) {
    this.offset = offset - 1;
    this.getGroups();
  }

}

export enum UserMgmtTabs {
  USERS, GROUPS
}
