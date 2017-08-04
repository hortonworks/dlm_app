/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

import { Component, OnInit, Input, Output, forwardRef, ViewEncapsulation, EventEmitter } from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
import { RadioItem } from './radio-button';

export const CUSTOM_RADIO_BUTTON_CONTROL_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
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
      'btn-primary': radio.value === selectedValue}">
        <input type="radio" [value]="radio.value" [checked]="radio.value === selectedValue">
        {{radio.label}}
      </label>
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
  @Output() change = new EventEmitter<RadioItem>();
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
    this.selectedValue = radio.value;
    this.onChange(this.selectedValue);
    this.change.emit(radio);
  }
}
