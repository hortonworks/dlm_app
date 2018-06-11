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

import { Component, OnInit, Input, Output, forwardRef, ViewEncapsulation, EventEmitter } from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
import { RadioItem } from './radio-button';
import {POLICY_TYPES} from 'constants/policy.constant';

export const CUSTOM_RADIO_BUTTON_CONTROL_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  /* tslint:disable-next-line:no-use-before-declare */
  useExisting: forwardRef(() => RadioButtonComponent),
  multi: true
};

@Component({
  selector: 'dlm-radio-button',
  template: `
    <div *ngIf="type === 'radio'" class="dlm-radio-group">
      <div *ngFor="let radio of items" class="dlm-radio-item">
        <input type="radio" [value]="radio.value" [checked]="radio.value === selectedValue">
        <label class="radio" (click)="selectValue(radio)">{{radio.label}}</label>
      </div>
    </div>
    <div *ngIf="type === 'buttons'" class="btn-group dlm-radio-group" data-toggle="buttons">
      <label *ngFor="let radio of items" (click)="selectValue(radio)"
      [ngClass]="{'btn': true, 'btn-default': radio.value !== selectedValue,
      'btn-primary': radio.value === selectedValue, 'disabled': disabled}">
        <input type="radio" [value]="radio.value" [checked]="radio.value === selectedValue">
        {{radio.label}}
      </label>
    </div>
    <div *ngIf="type === 'service_icons'" class="dlm-radio-group service-icons">
      <div class="service-icon" *ngFor="let radio of items" (click)="selectValue(radio)">
        <span class="hexagon-service-icon"
        [ngClass]="{'hexagon-warning': isHdfs(radio), 'hexagon-success': isHive(radio),
        'hexagon-default': radio.value !== selectedValue, 'active': radio.value === selectedValue}">
          <i class="fa" [ngClass]="{'fa-file hdfs': isHdfs(radio), 'fa-database hive': isHive(radio)}"></i>
        </span>
        <input type="radio" [value]="radio.value" [checked]="radio.value === selectedValue">
        <div class="service-label">
          {{radio.label}}
        </div>
      </div>
    </div>
  `,
  styleUrls: ['./radio-button.component.scss'],
  providers: [CUSTOM_RADIO_BUTTON_CONTROL_VALUE_ACCESSOR],
  encapsulation: ViewEncapsulation.None
})
export class RadioButtonComponent implements OnInit, ControlValueAccessor {
  @Input() items: RadioItem[] = [];
  @Input() selectedValue: string;
  @Input() type = 'radio';
  @Input() disabled = false;
  @Output() change = new EventEmitter<RadioItem>();
  POLICY_TYPES = POLICY_TYPES;

  onChange = (_: any) => {};

  constructor() { }

  ngOnInit() { }

  writeValue(value: any) {
    this.selectedValue = value;
  }

  registerOnChange(onChange) {
    this.onChange = onChange;
  }

  registerOnTouched() { }

  selectValue(radio: RadioItem) {
    if (this.disabled === true) {
      return;
    }
    this.selectedValue = radio.value;
    this.onChange(this.selectedValue);
    this.change.emit(radio);
  }

  isHdfs(radio: RadioItem) {
    return radio.value === POLICY_TYPES.HDFS;
  }

  isHive(radio: RadioItem) {
    return radio.value === POLICY_TYPES.HIVE;
  }
}
