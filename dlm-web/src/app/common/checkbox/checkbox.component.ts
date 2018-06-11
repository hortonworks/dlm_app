/*
 * HORTONWORKS DATAPLANE SERVICE AND ITS CONSTITUENT SERVICES
 *
 * (c) 2016-2018 Hortonworks, Inc. All rights reserved.
 *
 * This code is provided to you pursuant to your written agreement with Hortonworks, which may be the terms
 * of the Affero General Public License version 3 (AGPLv3), or pursuant to a written agreement with a third party
 * authorized to distribute this code.  If you do not have a written agreement with Hortonworks or with
 * an authorized and properly licensed third party, you do not have any rights to this code.
 *
 * If this code is provided to you under the terms of the AGPLv3: A) HORTONWORKS PROVIDES THIS CODE TO YOU
 * WITHOUT WARRANTIES OF ANY KIND; (B) HORTONWORKS DISCLAIMS ANY AND ALL EXPRESS AND IMPLIED WARRANTIES WITH
 * RESPECT TO THIS CODE, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF TITLE, NON-INFRINGEMENT, MERCHANTABILITY
 * AND FITNESS FOR A PARTICULAR PURPOSE; (C) HORTONWORKS IS NOT LIABLE TO YOU, AND WILL NOT DEFEND, INDEMNIFY,
 * OR HOLD YOU HARMLESS FOR ANY CLAIMS ARISING FROM OR RELATED TO THE CODE; AND (D) WITH RESPECT
 * TO YOUR EXERCISE OF ANY RIGHTS GRANTED TO YOU FOR THE CODE, HORTONWORKS IS NOT LIABLE FOR ANY DIRECT,
 * INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, PUNITIVE OR CONSEQUENTIAL DAMAGES INCLUDING, BUT NOT LIMITED TO,
 * DAMAGES RELATED TO LOST REVENUE, LOST PROFITS, LOSS OF INCOME, LOSS OF BUSINESS ADVANTAGE OR UNAVAILABILITY,
 * OR LOSS OR CORRUPTION OF DATA.
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
