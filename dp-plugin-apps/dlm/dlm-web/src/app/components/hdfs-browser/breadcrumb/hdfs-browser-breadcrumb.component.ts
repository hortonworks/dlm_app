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
export class HdfsBrowserBreadcrumbComponent implements OnChanges {
  @Input() breadcrumbs: Breadcrumb[];
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
