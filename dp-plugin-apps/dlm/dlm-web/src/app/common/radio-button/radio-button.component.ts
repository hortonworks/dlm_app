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
    <div class="dlm-radio-group">
      <div *ngFor="let radio of items" class="dlm-radio-item">
        <input type="radio" [value]="radio.value" [checked]="radio.value === selectedValue">
        <label class="radio" (click)="selectValue(radio)">{{radio.label}}</label>
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