/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
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
