import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { DropdownItem } from './dropdown-item';

@Component({
  selector: 'dp-dropdown',
  templateUrl: './dropdown.component.html',
  styleUrls: ['./dropdown.component.scss']
})
export class DropdownComponent implements OnInit {

  constructor() { }

  @Input()
  text: string;

  @Input()
  items: DropdownItem[];

  @Input()
  buttonClass: string = 'btn-primary';

  @Output()
  onSelectItem = new EventEmitter<DropdownItem>();

  @Input()
  type: string;

  ngOnInit() {
  }

  selectItem(item: DropdownItem) {
    this.onSelectItem.emit(item);
  }

}
