/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
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
      </li>
      <li class="summary-tree-item" *ngFor="let item of items">
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
  @HostBinding('class') className = 'dlm-summary-tree';
  subscriptions: Subscription[] = [];

  constructor(private ref: ChangeDetectorRef) {}
}
