/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

import {
  Component, OnInit, Input, Output, ViewEncapsulation, forwardRef, ChangeDetectionStrategy,
  EventEmitter, ContentChild, OnChanges, SimpleChanges, HostListener, ElementRef, HostBinding, OnDestroy
} from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor, FormControl } from '@angular/forms';
import { SelectOption } from './select-option.type';
import { SelectFieldOptionDirective } from './select-field-option.directive';
import { SelectFieldValueDirective } from './select-field-value.directive';
import { SelectFieldDropdownDirective } from './select-field-dropdown.directive';

export const CUSTOM_SELECT_CONTROL_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  /* tslint:disable-next-line:no-use-before-declare */
  useExisting: forwardRef(() => SelectFieldComponent),
  multi: true
};
// TODO: Multiselect??
@Component({
  selector: 'dlm-select-field',
  styleUrls: ['./select-field.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [CUSTOM_SELECT_CONTROL_VALUE_ACCESSOR],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="select-field-container">
      <div class="form-control actionable" [attr.disabled]="disabled ? disabled : null" (click)="toggleMenu()">
        <div class="selected-item">
          <div *ngIf="!valueView?.template">
            {{selectedOption.label || selectedOption.value || ('common.none' | translate)}}
          </div>
          <ng-container
            *ngTemplateOutlet="valueView?.template; context: {value: selectedOption.value, label: selectedOption.label}">
          </ng-container>
          <span class="caret"></span>
        </div>
      </div>
      <ng-container
        *ngTemplateOutlet="dropdownView?.template;
          context: {showMenu: showMenu, options: options, dropdownActionEmitter: dropdownActionEmitter}">
      </ng-container>
      <div *ngIf="!dropdownView?.template">
        <ul class="select-field-option-list select-field-options-wrapper list-unstyled" *ngIf="showMenu">
          <li class="select-field-option-item" *ngFor="let option of options"
              (click)="selectOption(option.value)">
            <div *ngIf="!optionView?.template">
              {{option.label || option.value}}
            </div>
            <ng-container *ngTemplateOutlet="optionView?.template; context: {value: option.value, label: option.label}">
            </ng-container>
          </li>
        </ul>
      </div>
    </div>
  `
})
export class SelectFieldComponent implements OnInit, ControlValueAccessor, OnChanges, OnDestroy {
  private defaultValue: SelectOption = {
    label: 'None',
    value: null
  };
  focused = false;
  showMenu = false;
  selectedOption: SelectOption;
  dropdownActionEmitter = new EventEmitter<string>();
  @Input() value: any;
  @Input() options: SelectOption[];
  @Input() disabled = false;
  @Output() onSelect = new EventEmitter<SelectOption>();
  @ContentChild(SelectFieldValueDirective) valueView: SelectFieldValueDirective;
  @ContentChild(SelectFieldOptionDirective) optionView: SelectFieldOptionDirective;
  @ContentChild(SelectFieldDropdownDirective) dropdownView: SelectFieldDropdownDirective;
  @HostBinding() tabindex = 0;

  @HostListener('document:click', ['$event'])
  outsideClickHandler(e) {
    if (!this.elementRef.nativeElement.contains(e.target)) {
      this.showMenu = false;
    }
  }

  onChange = (_: any) => {};

  constructor(private elementRef: ElementRef) {
  }

  @HostListener('focusin', ['$event.target'])
  focusIn(e) {
    this.focused = true;
  }

  @HostListener('focusout', ['$event.target'])
  focusOut(e) {
    this.focused = false;
    this.showMenu = false;
  }

  @HostListener('document:keydown', ['$event'])
  keyEvent(event: KeyboardEvent) {
    if (!this.focused) {
      return;
    }
    if (event.keyCode === 38) { // arrow up
      this.selectPrev();
    }

    if (event.keyCode === 40) { // arrow down
      this.selectNext();
    }
    // arrow up, arrow down or space
    if (event.keyCode === 38 || event.keyCode === 40 || event.keyCode === 32) {
      this.showMenu = true;
      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
    }
  }

  selectNext() {
    let index = 0;
    if (this.selectedOption) {
      if (this.options[this.options.length - 1] !== this.selectedOption) {
        index = this.options.indexOf(this.selectedOption) + 1;
      }
    }
    this.selectOption(this.options[index].value);
  }

  selectPrev() {
    let index = this.options.length - 1;
    if (this.selectedOption) {
      if (this.options[0] !== this.selectedOption) {
        index = this.options.indexOf(this.selectedOption) - 1;
      }
    }
    this.selectOption(this.options[index].value);
  }

  ngOnInit() {
    this.dropdownActionEmitter.subscribe(val => this.selectOption(val));
  }

  findOptionByValue(value) {
    return this.options.find(option => '' + option.value === '' + value);
  }

  ngOnChanges(changes: SimpleChanges) {
    if (this.options) {
      this.selectedOption = this.findOptionByValue(this.value) || this.defaultValue;
    }
  }

  writeValue(value: any) {
    this.value = value;
    if (this.options) {
      this.selectedOption = this.findOptionByValue(this.value) || this.defaultValue;
    }
  }

  ngOnDestroy() {
    this.dropdownActionEmitter.unsubscribe();
  }

  registerOnChange(onChange) {
    this.onChange = onChange;
  }

  registerOnTouched() {
  }

  selectOption(value: any) {
    this.value = value;
    this.selectedOption = this.options.find(option => '' + option.value === '' + this.value);
    this.onChange(value);
    this.onSelect.emit(this.selectedOption);
    this.toggleMenu();
  }

  toggleMenu(): void {
    if (this.disabled) {
      return;
    }
    this.showMenu = !this.showMenu;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }
}
