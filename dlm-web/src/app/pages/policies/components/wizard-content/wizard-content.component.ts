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

import {
  Component, Input, ViewEncapsulation,
  HostBinding, ChangeDetectionStrategy
} from '@angular/core';

@Component({
  selector: 'dlm-wizard-content',
  styleUrls: ['./wizard-content.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="wizard-content">
      <h4 class="step-title">{{stepIndex}}. {{stepLabel}}</h4>
      <p class="step-description" *ngIf="stepDescription">{{stepDescription}}</p>
      <div class="panel panel-default">
        <div class="panel-body" [ngClass]="{'with-summary': showSummary}">
          <div class="panel-content">
            <ng-content select="[wizard-content-body]"></ng-content>
          </div>
          <div class="summary-panel" *ngIf="showSummary">
            <ng-content select="[wizard-content-summary]"></ng-content>
          </div>
        </div>
      </div>
    </div>
  `
})
export class WizardContentComponent {

  @Input() stepLabel: string;
  @Input() stepIndex: number;
  @Input() stepDescription: string;
  @Input() showSummary = true;
  @HostBinding('class') className = 'dlm-wizard-content';

  constructor() {}
}
