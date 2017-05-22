import { Directive, TemplateRef } from '@angular/core';

@Directive({
  selector: '[selectFieldValue]'
})
export class SelectFieldValueDirective {
  constructor(public template: TemplateRef<any>) {}
};
