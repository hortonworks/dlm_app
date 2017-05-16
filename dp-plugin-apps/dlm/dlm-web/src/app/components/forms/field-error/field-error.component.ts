import { Component, OnInit, Input, ViewEncapsulation, HostBinding } from '@angular/core';

@Component({
  selector: 'dlm-field-error',
  styleUrls: ['./field-error.component.scss'],
  encapsulation: ViewEncapsulation.None,
  template: `
    <div [ngClass]="{alert: true, 'alert-warning': isWarning, 'alert-danger': isError}">
      <i [ngClass]="{fa: true, 'fa-exclamation-circle': isError, 'fa-exclamation-triangle': isWarning}"></i>
      <ng-content></ng-content>
    <div>
  `
})
export class FieldErrorComponent implements OnInit {
  @Input() isWarning = false;
  @Input() isError = true;
  @HostBinding('class') fieldErrorClass = 'dlm-field-error';

  ngOnInit() {
  }

}
