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

import { Component, Input, ViewEncapsulation, HostBinding } from '@angular/core';
import { ProgressState } from 'models/progress-state.model';

/**
 * This component wraps passed content with loading indicator.
 *
 * Attention!!!
 * Passed content like components will be initialized for any circumstances even
 * when `progressState` indicates that view is in progress. This is because of <ng-content> behavior.
 * This means that if your component depends on some DOM node present in document's DOM
 * and you expect that component may break on init stage, you need to wrap this component with *ngIf by yourself
 * to control component initialization.
 *
 * For more info please check: https://github.com/angular/angular/issues/13921
 */
@Component({
  selector: 'dlm-progress-container',
  styleUrls: ['./progress-container.component.scss'],
  encapsulation: ViewEncapsulation.None,
  template: `
    <div class="progress-container-wrapper">
      <ng-content *ngIf="!progressState?.isInProgress"></ng-content>
      <div class="progress-container-waiting" *ngIf="progressState?.isInProgress">
        <dlm-spinner></dlm-spinner>
      </div>
    </div>
  `
})
export class ProgressContainerComponent {
  @Input() progressState: ProgressState;
  @HostBinding('class') componentClass = 'dlm-progress-container';
}
