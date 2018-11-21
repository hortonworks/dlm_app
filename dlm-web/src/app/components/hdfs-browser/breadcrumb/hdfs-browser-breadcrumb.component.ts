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

import { Component, Input, Output, EventEmitter, HostBinding, OnChanges } from '@angular/core';
import { Breadcrumb } from 'components/breadcrumb/breadcrumb.type';
import { DropdownItem } from 'components/dropdown/dropdown-item';

const BREADCRUMBS_MAX_LENGTH = 3;
const DROPDOWN_MIN_LENGTH = 2;

@Component({
  selector: 'dlm-hdfs-browser-breadcrumb',
  styleUrls: ['./hdfs-browser-breadcrumb.component.scss'],
  template: `
    <div class="breadcrumbs">
      <span class="cluster-name" qe-attr="hdfs-browser-cluster-name" *ngIf="clusterName">
        {{clusterName}}
      </span>
      <span>
        <span *ngIf="dropdownMenuItems.length > 0">
          <dlm-dropdown
            [items]="dropdownMenuItems"
            [text]="dropdownText"
            [buttonClass]="buttonClass"
            [type]="dropdownType"
            [showChevron]="false"
            (onSelectItem)="handleDropdownClick($event)"
            >
          </dlm-dropdown>
        </span>
        <span *ngFor="let breadcrumb of breadcrumbs" class="breadcrumb-item">
          <a *ngIf="breadcrumb.url !== ''" class="nameLink" (click)="handleClick(breadcrumb.url)">
            {{breadcrumb.label}}
          </a>
          <span *ngIf="breadcrumb.url === ''">{{breadcrumb.label}}</span>
        </span>
      </span>
    </div>
  `,
})
export class HdfsBrowserBreadcrumbComponent implements OnChanges {
  @Input() breadcrumbs: Breadcrumb[];
  @Input() clusterName: string;
  @Output() onClick: EventEmitter<string> = new EventEmitter<string>();
  @HostBinding('class') componentClass = 'dlm-hdfs-browser-breadcrumb';
  buttonClass = 'btn-secondary';
  dropdownType = 'link';
  dropdownText = '<span class="fa-stack">' +
      '<i class="fa fa-folder-o fa-stack-2x"></i>' +
      '<i class="fa fa-caret-down fa-stack-1x"></i>' +
      '</span>';
  dropdownMenuItems: DropdownItem[] = [];

  constructor() {
  }

  ngOnChanges() {
    this.dropdownMenuItems = [];
    if (this.breadcrumbs.length >= BREADCRUMBS_MAX_LENGTH + DROPDOWN_MIN_LENGTH) {
      const dropdownLength = this.breadcrumbs.length - BREADCRUMBS_MAX_LENGTH;
      this.dropdownMenuItems = this.breadcrumbs.splice(0, dropdownLength).map(breadcrumb => {
        return {
          label: breadcrumb.label,
          url: breadcrumb.url,
          disabled: !breadcrumb.url
        };
      });
    }
  }

  handleClick(url: string) {
    this.onClick.emit(url);
  }

  handleDropdownClick(item: DropdownItem) {
    this.handleClick(item.url);
  }
}
