import { Component, OnInit, Input, forwardRef, ViewEncapsulation } from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor, FormBuilder, FormGroup } from '@angular/forms';

export const CHECKBOX_LIST_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
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
