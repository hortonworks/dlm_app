/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

import { Component, OnInit, Input, Output, forwardRef, EventEmitter } from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';

export const SEARCH_INPUT_CONTROL_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => SearchInputComponent),
  multi: true
};

@Component({
  selector: 'dlm-search-input',
  styleUrls: ['./search-input.component.scss'],
  template: `
    <div class="row">
      <div class="col-md-12">
        <span class="glyphicon glyphicon-search"></span>
        <input class="form-control" (keyup)="onKeyup($event)" type="search" [value]="value"/>
      </div>
    </div>
  `,
  providers: [SEARCH_INPUT_CONTROL_VALUE_ACCESSOR]

})
export class SearchInputComponent implements OnInit, ControlValueAccessor {
  @Input() value = '';
  @Output() valueChange = new EventEmitter<string>();
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
    this.valueChange.emit(value);
  }
}
