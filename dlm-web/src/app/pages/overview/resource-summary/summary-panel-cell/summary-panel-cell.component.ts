/*
 * HORTONWORKS DATAPLANE SERVICE AND ITS CONSTITUENT SERVICES
 *
 * (c) 2016-2018 Hortonworks, Inc. All rights reserved.
 *
 * This code is provided to you pursuant to your written agreement with Hortonworks, which may be the terms
 * of the Affero General Public License version 3 (AGPLv3), or pursuant to a written agreement with a third party
 * authorized to distribute this code.  If you do not have a written agreement with Hortonworks or with
 * an authorized and properly licensed third party, you do not have any rights to this code.
 *
 * If this code is provided to you under the terms of the AGPLv3: A) HORTONWORKS PROVIDES THIS CODE TO YOU
 * WITHOUT WARRANTIES OF ANY KIND; (B) HORTONWORKS DISCLAIMS ANY AND ALL EXPRESS AND IMPLIED WARRANTIES WITH
 * RESPECT TO THIS CODE, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF TITLE, NON-INFRINGEMENT, MERCHANTABILITY
 * AND FITNESS FOR A PARTICULAR PURPOSE; (C) HORTONWORKS IS NOT LIABLE TO YOU, AND WILL NOT DEFEND, INDEMNIFY,
 * OR HOLD YOU HARMLESS FOR ANY CLAIMS ARISING FROM OR RELATED TO THE CODE; AND (D) WITH RESPECT
 * TO YOUR EXERCISE OF ANY RIGHTS GRANTED TO YOU FOR THE CODE, HORTONWORKS IS NOT LIABLE FOR ANY DIRECT,
 * INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, PUNITIVE OR CONSEQUENTIAL DAMAGES INCLUDING, BUT NOT LIMITED TO,
 * DAMAGES RELATED TO LOST REVENUE, LOST PROFITS, LOSS OF INCOME, LOSS OF BUSINESS ADVANTAGE OR UNAVAILABILITY,
 * OR LOSS OR CORRUPTION OF DATA.
 */

import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'dlm-summary-panel-cell',
  template: `
    <div class="text-center">
      <p class="cell-label">
        <i [class]="iconClass"></i>
        <span class="text-muted">
          {{label}}
          <dlm-help-link [iconHint]="hint"></dlm-help-link>
        </span>
      </p>
      <p class="cell-value" [class.btn-link]="actionable" [class.actionable]="actionable" (click)="handleCellClick($event)">
        <span *ngIf="value > 0; else dash">{{value}}</span>
        <ng-template #dash>
          <span class="text-muted">-</span>
        </ng-template>
      </p>
   </div>
  `,
  styleUrls: ['./summary-panel-cell.component.scss']
})
export class SummaryPanelCellComponent implements OnInit {

  @Input() label: string;
  @Input() value: number;
  @Input() iconClass: string;
  @Input() hint = '';
  @Input() actionable = false;
  @Output() cellClick = new EventEmitter<any>();

  constructor() { }

  ngOnInit() {
  }

  handleCellClick(e: MouseEvent) {
    if (!this.actionable) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    this.cellClick.emit({ label: this.label, value: this.value });
  }

}
