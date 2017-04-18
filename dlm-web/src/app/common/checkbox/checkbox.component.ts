import { Component, OnInit, Input, Output, forwardRef, EventEmitter } from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';

export const CUSTOM_CHECKBOX_CONTROL_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => CheckboxComponent),
  multi: true
};
@Component({
  selector: 'dlm-checkbox',
  styleUrls: ['./checkbox.component.scss'],
  template: `
    <div class="checkbox-item">
      <input type="checkbox" [checked]="checked" />
      <label class="checkbox" (click)="toggleChecked()">
        <ng-content></ng-content>
      </label>
    </div>
  `,
  providers: [CUSTOM_CHECKBOX_CONTROL_VALUE_ACCESSOR],
})
export class CheckboxComponent implements OnInit, ControlValueAccessor {
  @Input() checked: boolean;
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
    this.checked = !this.checked;
    this.onChange(this.checked);
    this.onSelect.emit(this.checked);
  }

}
