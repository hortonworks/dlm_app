/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

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
