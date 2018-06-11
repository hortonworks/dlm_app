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
  HostBinding, ChangeDetectionStrategy, ChangeDetectorRef
} from '@angular/core';
import { Subscription } from 'rxjs/Subscription';
import { SummaryTreeItem } from 'models/policy.model';

@Component({
  selector: 'dlm-summary-tree',
  styleUrls: ['./summary-tree.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ul class="summary-tree-wrapper">
      <li class="summary-tree-item">
        <span class="step-icon">
          <i class="fa fa-fw fa-circle"></i>
        </span>
        <div class="details">
          <div class="header">{{header}}</div>
        </div>
      </li>
      <li [attr.qe-attr]="'summary-tree-item-' + i" class="summary-tree-item" *ngFor="let item of items; let i = index;">
        <span class="step-icon">
          <i [ngClass]="['fa', 'fa-fw', item?.iconClass]"></i>
        </span>
        <div class="details">
          <div class="name">{{item.label}}</div>
          <div class="detail">{{item.value}}</div>
        </div>
      </li>
    </ul>
  `
})

export class SummaryTreeComponent {

  @Input() items: SummaryTreeItem[] = [];
  @Input() header = '';
  @HostBinding('class') className = 'dlm-summary-tree';
  subscriptions: Subscription[] = [];

  constructor(private ref: ChangeDetectorRef) {}
}
