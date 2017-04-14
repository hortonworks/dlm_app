import { Component, OnInit, Input, Output, forwardRef, EventEmitter } from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';

export const SEARCH_INPUT_CONTROL_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => SearchInputComponent),
  multi: true
};

@Component({
  selector: 'dlm-search-input',
  templateUrl: './search-input.component.html',
  styleUrls: ['./search-input.component.scss'],
  providers: [SEARCH_INPUT_CONTROL_VALUE_ACCESSOR]

})
export class SearchInputComponent implements OnInit, ControlValueAccessor {
  @Input() value = '';
  @Output() change = new EventEmitter<string>();
  onChange = (_: any) => {};

  constructor() { }

  ngOnInit() {
  }

  writeValue(value: string) {
    if (value) {
      this.value = value;
    }
  }

  registerOnChange(onChange) {
    this.onChange = onChange;
  }

  registerOnTouched() {}

  onKeyup(event: any) {
    const value = event.target.value;
    this.onChange(value);
    this.change.emit(value);
  }
}
