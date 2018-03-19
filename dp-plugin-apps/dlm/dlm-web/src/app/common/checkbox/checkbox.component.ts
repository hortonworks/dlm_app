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

export const CUSTOM_CHECKBOX_CONTROL_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  /* tslint:disable-next-line:no-use-before-declare */
  useExisting: forwardRef(() => CheckboxComponent),
  multi: true
};
@Component({
  selector: 'dlm-checkbox',
  styleUrls: ['./checkbox.component.scss'],
  template: `
    <div class="checkbox-item">
      <input type="checkbox" [disabled]="disabled" [checked]="checked" />
      <label class="checkbox" (click)="toggleChecked()">
        <ng-content></ng-content>
      </label>
    </div>
  `,
  providers: [CUSTOM_CHECKBOX_CONTROL_VALUE_ACCESSOR],
})
export class CheckboxComponent implements OnInit, ControlValueAccessor {
  @Input() checked: boolean;
  @Input() disabled = false;
  @Output() onSelect = new EventEmitter<boolean>();

  onChange = (_: any) => {};

  constructor() { }

  ngOnInit() { }

  writeValue(checked: boolean) {
    this.checked = checked;
  }

  registerOnChange(onChange) {
    this.onChange = onChange;
  }

  registerOnTouched() {}

  toggleChecked() {
    if (this.disabled) {
      return;
    }
    this.checked = !this.checked;
    this.onChange(this.checked);
    this.onSelect.emit(this.checked);
  }

}
