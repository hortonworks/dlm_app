import { Component, Input, OnInit, ContentChild, ViewEncapsulation } from '@angular/core';
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
  @ContentChild(FormFieldDirective) formField: FormFieldDirective;
  labelTranslate: object;
  fieldControl: NgControl;

  ngOnInit() {
    this.fieldControl = this.formField.formFieldControl;
    this.labelTranslate = { fieldLabel: this.label };
  }
}
