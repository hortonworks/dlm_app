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

import { Component, OnInit, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';

export enum TabStyleType {
  UNDERLINE, BUTTON, LAYOUT
}

@Component({
  selector: 'dp-tabs',
  templateUrl: './tabs.component.html',
  styleUrls: ['./tabs.component.scss']
})

export class TabsComponent implements OnChanges {
  @Input() tabType: TabStyleType = TabStyleType.UNDERLINE;
  @Input() tabEnum: any;
  @Input() images = {};
  @Input() activeTabName: string = '';
  @Output() selected = new EventEmitter<string>();

  tabNames: string[] = [];
  //activeTabName: string = '';
  tabTypes = TabStyleType;
  imagesLength = 0;

  onTabSelect(name: string) {
    this.activeTabName = name;
    this.selected.emit(this.tabEnum[this.activeTabName]);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['tabEnum'] && changes['tabEnum'].currentValue) {
      let keys: any = Object.keys(changes['tabEnum'].currentValue);
      this.tabNames = keys.filter(v => { return isNaN(v); });
    }

    if (changes['images'] && changes['images'].currentValue) {
      this.imagesLength = Object.keys(this.images).length;
    }
  }
}
