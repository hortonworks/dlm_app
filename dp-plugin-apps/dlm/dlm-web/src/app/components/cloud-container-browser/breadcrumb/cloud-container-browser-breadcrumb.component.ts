/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

import { Component, Input, Output, EventEmitter, HostBinding, OnChanges } from '@angular/core';
import { Breadcrumb } from 'components/breadcrumb/breadcrumb.type';
import { DropdownItem } from 'components/dropdown/dropdown-item';

const BREADCRUMBS_MAX_LENGTH = 3;
const DROPDOWN_MIN_LENGTH = 2;

// todo combine with hdfs-breadcrumbs

@Component({
  selector: 'dlm-cloud-container-browser-breadcrumb',
  styleUrls: ['./cloud-container-browser-breadcrumb.component.scss'],
  template: `
    <div class="breadcrumbs">
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
    </div>
  `,
})
export class CloudContainerBrowserBreadcrumbComponent implements OnChanges {
  @Input() breadcrumbs: Breadcrumb[];
  @Output() onClick: EventEmitter<string> = new EventEmitter<string>();
  @HostBinding('class') componentClass = 'dlm-cloud-container-browser-breadcrumb';
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
          url: breadcrumb.url
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