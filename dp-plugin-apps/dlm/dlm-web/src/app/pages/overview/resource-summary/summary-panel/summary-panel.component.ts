/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'dlm-summary-panel',
  template: `
    <div class="panel panel-default">
      <div class="panel-heading flex-center">
        <span class="panel-title">
          {{title | translate}}
          <dlm-help-link [iconHint]="hint"></dlm-help-link>
        </span>
        <span class="total-counter">{{total}}</span>
      </div>
      <div class="panel-body">
        <ng-content></ng-content>
      </div>
    </div>
  `,
  styleUrls: ['./summary-panel.component.scss']
})
export class SummaryPanelComponent implements OnInit {

  @Input() hint = '';
  @Input() title: string;
  @Input() total: string|number;

  constructor() { }

  ngOnInit() {
  }

}
