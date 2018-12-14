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

import { Component, OnInit, Input, ViewEncapsulation, HostBinding } from '@angular/core';

@Component({
  selector: 'dlm-page-header',
  styleUrls: ['./page-header.component.scss'],
  encapsulation: ViewEncapsulation.None,
  template: `
    <div>
      <div class="row">
        <div class="col-xs-12">
          <i [class]="iconClass" *ngIf="iconClass"></i>
          <span class="page-title">
            {{title | translate}}
            <dlm-help-link [iconHint]="contextMessage"
            [icon]="helpLinkIcon"
            [linkText]="linkText | translate"
            [linkTo]="linkTo | translate"
            [placement]="'right'">
            </dlm-help-link>
          </span>
        </div>
      </div>
      <div class="row" *ngIf="description">
        <div class="col-xs-12">
          <div class="page-description">{{description | translate}}</div>
        </div>
      </div>
    </div>
  `
})
export class PageHeaderComponent implements OnInit {
  @Input() title = '';
  @Input() iconClass = '';
  @Input() description = '';
  @Input() contextMessage = '';
  @Input() linkText = '';
  @Input() linkTo = '';
  @Input() helpLinkIcon = 'fa fa-question-circle-o';
  @HostBinding('class') className = 'dlm-page-header';
  @HostBinding('class.flex-center') @Input() isFlexCenter = false;

  constructor() { }

  ngOnInit() {
  }

}
