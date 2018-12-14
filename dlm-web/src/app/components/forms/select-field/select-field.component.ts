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

import {
  Component, OnInit, Input, Output, ViewEncapsulation, forwardRef, ChangeDetectionStrategy,
  EventEmitter, ContentChild, OnChanges, SimpleChanges, HostListener, ElementRef, HostBinding, OnDestroy
} from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
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
            <div *ngIf="!optionView?.template" [attr.qe-attr]="option.value">
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
    if (!this.focused || this.disabled) {
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
