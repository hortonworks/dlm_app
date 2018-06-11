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

import { Component, Input } from '@angular/core';

/**
 * Usage examples:
 *
 * Question sign in the circle with a tooltip on hover
 * ```
 * <dlm-help-link [iconHint]="'some message'"></dlm-help-link>
 * ```
 *
 * GitHub icon with a tooltip on hover
 * ```
 * <dlm-help-link [iconHint]="'some message'" [icon]="'fa fa-github'"></dlm-help-link>
 * ```
 *
 * If `linkTo` is provided component will render a hyperlink and not an icon
 *
 * Hyperlink with a provided text and tooltip on hover. It'll will open a new tab after click by default
 * ```
 * <dlm-help-link [linkTo]="'http://example.com'" [linkText]="'Click Me!'" [linkHint]="'some message'"></dlm-help-link>
 * ```
 */
@Component({
  selector: 'dlm-help-link',
  template: `
    <span class="link-text" *ngIf="linkTo; else asIcon">
      <a [href]="linkTo" [target]="linkNewTab ? '_blank' : ''" [tooltip]="linkHint | translate">{{linkText | translate}}</a>
    </span>
    <ng-template #asIcon>
      <i class="text-info actionable" [ngClass]="icon" *ngIf="iconHint" [tooltip]="iconHint | translate"
      [placement]="placement"></i>
      <span *ngIf="iconLink">
        <a [href]="iconLink" [target]="'_blank'">
          <i class="text-info" [ngClass]="icon"></i>
        </a>
      </span>
    </ng-template>
  `,
  styleUrls: ['./help-link.component.scss']
})
export class HelpLinkComponent {

  /**
   * Font-awesome or glyphicon or any other icon-lib item
   * @type {string}
   */
  @Input() icon = 'fa fa-question-circle-o';
  /**
   * Tooltip message shown on icon hover
   * @type {string}
   */
  @Input() iconHint = '';
  /**
   * External link. Component renders link if `linkTo` is provided and is not empty (prefix `http(s)` should be in the url)
   * @type {string}
   */
  @Input() linkTo = '';
  /**
   * Open new tab on link-click
   * @type {boolean}
   */
  @Input() linkNewTab = true;
  /**
   * Link anchor
   * @type {string}
   */
  @Input() linkText = '';
  /**
   * Tooltip message shown in link hover
   * @type {string}
   */
  @Input() linkHint = '';

  /**
   * Help icon with hyperlink
   */
  @Input() iconLink = '';

  /**
   * Tooltip Placement
   */
  @Input() placement = 'bottom';

  constructor() {
  }

}
