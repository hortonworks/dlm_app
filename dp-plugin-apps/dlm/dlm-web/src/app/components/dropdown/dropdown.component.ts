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
  @Output() onSelectItem = new EventEmitter<DropdownItem>();

  constructor() { }


  ngOnInit() {
  }

  selectItem(item: DropdownItem) {
    this.onSelectItem.emit(item);
  }

}
