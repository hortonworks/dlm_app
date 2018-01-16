/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

import {
  Component, Input, OnInit, ContentChild, ViewEncapsulation, HostBinding, SimpleChanges,
  OnChanges
} from '@angular/core';
import { NgControl } from '@angular/forms';
import { FormFieldDirective } from './form-field.directive';

@Component({
  selector: 'dlm-form-field',
  templateUrl: './form-field.component.html',
  styleUrls: ['./form-field.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class FormFieldComponent implements OnInit, OnChanges {
  @Input() label: string;
  @Input() maxLengthValue: string|number;
  @ContentChild(FormFieldDirective) formField: FormFieldDirective;
  @Input() fieldClass = 'col-xs-6';
  @Input() errorClass = 'col-xs-6';
  @Input() required = false;
  @HostBinding('class') hostClass = 'dlm-form-field';

  labelTranslate: object;
  fieldControl: NgControl;

  ngOnInit() {
    this.fieldControl = this.formField.formFieldControl;
    this.labelTranslate = { fieldLabel: this.label, maxLengthValue: this.maxLengthValue };
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['label'] && this.labelTranslate) {
      this.labelTranslate['fieldLabel'] = changes['label'].currentValue;
    }

  }
}
