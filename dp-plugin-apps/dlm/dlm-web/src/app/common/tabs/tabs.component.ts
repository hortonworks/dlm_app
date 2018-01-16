/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

import { Component, EventEmitter, Input, Output } from '@angular/core';

export interface TabItem {
  value: any;
  title: string;
  badge: string;
}

@Component({
  selector: 'tabs',
  templateUrl: './tabs.component.html',
  styleUrls: ['./tabs.component.scss']
})

export class TabsComponent {
  @Input() items: TabItem[] = [];
  @Input() activeTabValue: any;
  @Output() clickOnItem = new EventEmitter<any>();

  itemClick(val) {
    this.clickOnItem.emit(val);
    return false;
  }
}
