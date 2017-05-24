import { Directive, TemplateRef } from '@angular/core';

@Directive({
  selector: '[selectFieldOption]'
})
export class SelectFieldOptionDirective {
  constructor(public template: TemplateRef<any>) {}
}
