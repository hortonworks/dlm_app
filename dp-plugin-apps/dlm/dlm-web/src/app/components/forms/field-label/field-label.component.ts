/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

import {Component, OnInit, Input, HostBinding} from '@angular/core';

@Component({
  selector: 'dlm-field-label',
  template: `
    <label>
      <ng-content></ng-content>
      <sup *ngIf="required">
        <i class="fa fa-asterisk text-danger"></i>
      </sup>
    </label>
  `,
  styleUrls: ['./field-label.component.scss']
})
export class FieldLabelComponent implements OnInit {

  @Input() required = false;
  @HostBinding('class') hostClass = 'dlm-field-label';

  constructor() { }

  ngOnInit() {
  }

}
