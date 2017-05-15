import { Directive, OnInit } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: '[formField]'
})
export class FormFieldDirective {
  formFieldControl: NgControl;

  constructor(private formControl: NgControl) {
    this.formFieldControl = formControl;
  }
}
