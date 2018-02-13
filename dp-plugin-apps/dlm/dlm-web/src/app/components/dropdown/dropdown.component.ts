/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { DropdownItem } from './dropdown-item';

@Component({
  selector: 'dlm-dropdown',
  templateUrl: './dropdown.component.html',
  styleUrls: ['./dropdown.component.scss']
})
export class DropdownComponent implements OnInit {

  @Input() text: string;
  @Input() items: DropdownItem[];
  @Input() buttonClass = 'btn-primary';
  @Input() alignRight = false;
  @Input() type: string;
  @Input() showChevron = true;
  @Input() selectable = false;
  @Input() isDropup = false;
  @Input() container = 'body';
  @Output() onSelectItem = new EventEmitter<DropdownItem>();

  get placement(): string {
    if (this.isDropup) {
      return 'top right';
    }
    return 'bottom right';
  }

  constructor() { }


  ngOnInit() {
    if (this.selectable && !this.text) {
      this.text = this.items[0].label;
    }
  }

  selectItem(item: DropdownItem) {
    if (this.selectable) {
      this.text = item.label;
    }
    if (!item.disabled) {
      this.onSelectItem.emit(item);
    }
  }

}
