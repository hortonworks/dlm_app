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
  @Output() onSelectItem = new EventEmitter<DropdownItem>();

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
    this.onSelectItem.emit(item);
  }

}
