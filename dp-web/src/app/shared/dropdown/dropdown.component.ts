import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'dp-dropdown',
  templateUrl: './dropdown.component.html',
  styleUrls: ['./dropdown.component.scss']
})
export class DropdownComponent {
  static counter = 0;
  uniqueId: string;
  @Input() name = 'ACTION';
  @Input() list: string[] = [];
  @Output() selected = new EventEmitter<string>();

  constructor() {
    this.uniqueId = 'DropdownComponent' + '_' + ++DropdownComponent.counter;
  }
}
