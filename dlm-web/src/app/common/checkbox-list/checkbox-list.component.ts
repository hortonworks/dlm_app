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

import { Component, OnInit, Input, forwardRef, ViewEncapsulation } from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor, FormBuilder, FormGroup } from '@angular/forms';

export const CHECKBOX_LIST_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  /* tslint:disable-next-line:no-use-before-declare */
  useExisting: forwardRef(() => CheckboxListComponent),
  multi: true
};

@Component({
  selector: 'dlm-checkbox-list',
  template: `
    <div class="checkbox-list">
      <div class="selectAll">
        <dlm-checkbox (onSelect)="handleSelectAll($event)">
          {{'common.all' | translate}}
        </dlm-checkbox>
      </div>
      <div *ngFor="let checkbox of items" class="checkbox-list-item" [formGroup]="checkboxGroup">
        <dlm-checkbox [formControlName]="checkbox">{{checkbox}}</dlm-checkbox>
      </div>
    </div>
  `,
  styleUrls: ['./checkbox-list.component.scss'],
  providers: [CHECKBOX_LIST_VALUE_ACCESSOR],
  encapsulation: ViewEncapsulation.None
})
export class CheckboxListComponent implements OnInit, ControlValueAccessor {
  @Input() items: string[];
  checkboxGroup: FormGroup;
  checkedItems: string[] = [];
  onChange = (_: any) => {};

  constructor(private formbBuilder: FormBuilder) { }

  makeCheckedMap(items: string[], defaultValue?: boolean) {
    return items.reduce((formFields, fieldName) => {
      return {
        ...formFields,
        [fieldName]: defaultValue || this.checkedItems.indexOf(fieldName) > -1
      };
    }, {});
  }

  ngOnInit() {
    const fields = this.makeCheckedMap(this.items);
    this.checkboxGroup = this.formbBuilder.group(fields);
    this.checkboxGroup.valueChanges
      .subscribe(values => this.onChange(Object.keys(values).filter(fieldName => values[fieldName])));
  }

  writeValue(checkedItems: string[]) {
    this.checkedItems = checkedItems;
  }

  registerOnChange(onChange) {
    this.onChange = onChange;
  }

  registerOnTouched() {}

  handleSelectAll(checked: boolean) {
    this.checkedItems = checked ? this.items : [];
    this.checkboxGroup.setValue(this.makeCheckedMap(this.items, checked));
    this.onChange(this.checkedItems);
  }
}
