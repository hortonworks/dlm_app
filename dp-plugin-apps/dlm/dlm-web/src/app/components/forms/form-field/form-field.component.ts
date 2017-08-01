import { Component, Input, OnInit, ContentChild, ViewEncapsulation, HostBinding } from '@angular/core';
import { NgControl } from '@angular/forms';
import { FormFieldDirective } from './form-field.directive';

@Component({
  selector: 'dlm-form-field',
  templateUrl: './form-field.component.html',
  styleUrls: ['./form-field.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class FormFieldComponent implements OnInit {
  @Input() label: string;
  @Input() maxLengthValue: string|number;
  @ContentChild(FormFieldDirective) formField: FormFieldDirective;
  @Input() fieldClass = 'col-md-6';
  @Input() errorClass = 'col-md-6';
  @HostBinding('class') hostClass = 'dlm-form-field';

  labelTranslate: object;
  fieldControl: NgControl;

  ngOnInit() {
    this.fieldControl = this.formField.formFieldControl;
    this.labelTranslate = { fieldLabel: this.label, maxLengthValue: this.maxLengthValue };
  }
}
