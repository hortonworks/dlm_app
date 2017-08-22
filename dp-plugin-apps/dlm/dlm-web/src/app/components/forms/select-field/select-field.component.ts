/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

import { Component, OnInit, Input, Output, ViewEncapsulation, forwardRef, ChangeDetectionStrategy,
  EventEmitter, ContentChild, OnChanges, SimpleChanges, HostListener, ElementRef
} from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor, NG_VALIDATORS, Validator, FormControl } from '@angular/forms';
import { SelectOption } from './select-option.type';
import { SelectFieldOptionDirective } from './select-field-option.directive';
import { SelectFieldValueDirective } from './select-field-value.directive';

export const CUSTOM_SELECT_CONTROL_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => SelectFieldComponent),
  multi: true
};
export const CUSTOM_SELECT_CONTROL_VALUE_VALIDATOR: any = {
  provide: NG_VALIDATORS,
  useExisting: forwardRef(() => SelectFieldComponent),
  multi: true
};
// TODO: Multiselect??
@Component({
  selector: 'dlm-select-field',
  styleUrls: ['./select-field.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [CUSTOM_SELECT_CONTROL_VALUE_ACCESSOR, CUSTOM_SELECT_CONTROL_VALUE_VALIDATOR],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="select-field-container">
      <div class="form-control actionable" (click)="toggleMenu()">
        <div class="selected-item">
          <div *ngIf="!valueView?.template">
            {{selectedOption.label || selectedOption.value || ('common.none' | translate)}}
          </div>
          <ng-container
            [ngTemplateOutlet]="valueView?.template"
            [ngOutletContext]="{value: selectedOption.value, label: selectedOption.label}">
          </ng-container>
          <span class="caret"></span>
        </div>
      </div>
      <ul class="select-field-option-list list-unstyled" *ngIf="showMenu">
        <li class="select-field-option-item" *ngFor="let option of options"
          (click)="selectOption(option.value)">
          <div *ngIf="!optionView?.template">
            {{option.label || option.value}}
          </div>
          <ng-container
            [ngTemplateOutlet]="optionView?.template"
            [ngOutletContext]="{value: option.value, label: option.label}">
          </ng-container>
        </li>
      </ul>
    </div>
  `
})
export class SelectFieldComponent implements OnInit, ControlValueAccessor, Validator, OnChanges {
  private defaultValue: SelectOption = {
    label: 'None',
    value: null
  };
  showMenu = false;
  selectedOption: SelectOption;
  @Input() value: any;
  @Input() options: SelectOption[];
  @Output() onSelect = new EventEmitter<SelectOption>();
  @ContentChild(SelectFieldValueDirective) valueView: SelectFieldValueDirective;
  @ContentChild(SelectFieldOptionDirective) optionView: SelectFieldOptionDirective;
  @HostListener('document:click', ['$event'])
  outsideClickHandler(e) {
    if (!this.elementRef.nativeElement.contains(e.target)) {
      this.showMenu = false;
    }
  }

  onChange = (_: any) => {};

  constructor(private elementRef: ElementRef) { }

  ngOnInit() {
  }

  ngOnChanges(changes: SimpleChanges) {
    if (this.options) {
      this.selectedOption = this.options.find(option => '' + option.value === '' + this.value) || this.defaultValue;
    }
  }

  writeValue(value: any) {
    this.value = value;
    if (this.options) {
      this.selectedOption = this.options.find(option => '' + option.value === '' + this.value) || this.defaultValue;
    }
  }

  registerOnChange(onChange) {
    this.onChange = onChange;
  }

  registerOnTouched() {}

  selectOption(value: any) {
    this.value = value;
    this.selectedOption = this.options.find(option => '' + option.value === '' + this.value);
    this.onChange(value);
    this.onSelect.emit(this.selectedOption);
    this.toggleMenu();
  }

  validate(control: FormControl) {
    if (!this.value) {
      return { required: true };
    }
    return null;
  }

  toggleMenu() {
    this.showMenu = !this.showMenu;
  }
}
