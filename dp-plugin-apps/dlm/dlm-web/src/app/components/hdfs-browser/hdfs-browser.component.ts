/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

import { Component, Input, Output, ViewEncapsulation, EventEmitter,
  ViewChild, HostBinding, OnInit, OnDestroy, TemplateRef, SimpleChange, OnChanges } from '@angular/core';
import { ListStatus } from 'models/list-status.model';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Store } from '@ngrx/store';
import { getAllFilesForClusterPath } from 'selectors/hdfs.selector';
import * as fromRoot from 'reducers';
import { listFiles } from 'actions/hdfslist.action';
import { TableComponent } from 'common/table/table.component';
import { FILE_TYPES } from 'constants/hdfs.constant';
import { Breadcrumb } from 'components/breadcrumb/breadcrumb.type';

@Component({
  selector: 'dlm-hdfs-browser',
  styleUrls: ['./hdfs-browser.component.scss'],
  encapsulation: ViewEncapsulation.None,
  template: `
    <dlm-hdfs-browser-breadcrumb [breadcrumbs]="breadcrumbs$ | async" (onClick)="switchDirectory($event)">
    </dlm-hdfs-browser-breadcrumb>
    <dlm-table
      #hdfsFilesTable
      [columns]="columns"
      [rows]="rows$ | async"
      [selectionType]="selectionType"
      [scrollbarV]="scrollbarV"
      (selectRowAction)="handleSelectedAction($event)"
      [externalSorting]="externalSorting"
      [rowHeight]="rowHeight"
      (doubleClickAction)="handleDoubleClickAction($event)"
      (sortAction)="handleSortAction($event)"
    >
    </dlm-table>
    <ng-template #nameFormattedTemplate let-value="value" let-row="row">
      <i *ngIf="row.pathSuffix !== '..'"
      [ngClass]="{'fa': true, 'fa-folder-o': row.type === fileTypes.DIRECTORY, 'fa-file-text-o': row.type !== fileTypes.DIRECTORY}"></i>
      <a *ngIf="row.type === fileTypes.DIRECTORY" class="nameLink" (click)="handleDoubleClickAction(row)">
        <span *ngIf="row.pathSuffix !== '..'" [innerHTML]="value" style="padding-left: 5px;"></span>
        <i *ngIf="row.pathSuffix === '..'" class="fa fa-reply"></i>
      </a>
      <span *ngIf="row.type !== fileTypes.DIRECTORY" [innerHTML]="value" style="padding-left: 5px;"></span>
    </ng-template>
    <ng-template #sizeFormattedTemplate let-value="value">
      <span *ngIf="value > 0" [innerHTML]="value | bytesSize"></span>
      <span *ngIf="value === 0">- -</span>
    </ng-template>
    <ng-template #dateTemplate let-value="value">
      <span *ngIf="value > 0">{{value | amDateFormat:'YYYY-MM-DD HH:mm:ss'}}</span>
    </ng-template>
    <ng-template #permissionsTemplate let-value="value" let-row="row">
      <span *ngIf="value" [innerHTML]="convertPermissions(value, row.type)"></span>
    </ng-template>
  `,
})
export class HdfsBrowserComponent implements OnInit, OnChanges, OnDestroy {
  @Input() clusterId: number;
  @Input() rootPath: string;
  @Output() select: EventEmitter<string> = new EventEmitter<string>();
  @HostBinding('class') componentClass = 'dlm-hdfs-browser';
  @ViewChild('hdfsFilesTable') jobsTable: TableComponent;
  @ViewChild('sizeFormattedTemplate') sizeFormattedTemplate: TemplateRef<any>;
  @ViewChild('dateTemplate') dateTemplate: TemplateRef<any>;
  @ViewChild('permissionsTemplate') permissionsTemplate: TemplateRef<any>;
  @ViewChild('nameFormattedTemplate') nameFormattedTemplate: TemplateRef<any>;
  breadcrumbs$: Observable<Breadcrumb[]>;
  rows$: Observable<ListStatus[]>;
  rows: ListStatus[];
  currentDirectory$: BehaviorSubject<string>;
  columns: any = [];
  externalSorting = true;
  scrollbarV = false;
  selectionType = 'single';
  rowHeight = '35';
  selected: string;
  fileTypes = FILE_TYPES;

  constructor(private store: Store<fromRoot.State>) {
  }

  ngOnInit() {
    this.currentDirectory$ = new BehaviorSubject(this.rootPath);
    this.rows$ = this.currentDirectory$.switchMap(path => {
      this.store.dispatch(listFiles(this.clusterId, path, {clusterId: this.clusterId, path}));
      return this.store.select(getAllFilesForClusterPath(this.clusterId, path)).map(files => {
        const parent = path === '/' ? [] : [<ListStatus>{pathSuffix: '..', type: FILE_TYPES.DIRECTORY}];
        return [...parent, ...files];
      });
    });
    this.breadcrumbs$ = this.currentDirectory$.map(path => this.updateBreadcrumbs(path));
    this.columns = [
      {prop: 'pathSuffix', name: 'Name', cellClass: 'text-cell', headerClass: 'text-header',
        minWidth: 150, flexGrow: 1, cellTemplate: this.nameFormattedTemplate},
      {prop: 'length', name: 'Size', cellClass: 'text-cell', headerClass: 'text-header',
        cellTemplate: this.sizeFormattedTemplate, maxWidth: 120},
      {prop: 'owner', name: 'Owner', cellClass: 'text-cell', headerClass: 'text-header', maxWidth: 150},
      {prop: 'group', name: 'Group', cellClass: 'text-cell', headerClass: 'text-header', maxWidth: 150},
      {prop: 'permission', name: 'Permission', cellClass: 'text-cell',
        headerClass: 'text-header', cellTemplate: this.permissionsTemplate, sortable: false, maxWidth: 120},
      {prop: 'modificationTime', name: 'Last Modified', cellClass: 'date-cell', headerClass: 'date-header',
        cellTemplate: this.dateTemplate, maxWidth: 130}
    ];
  }

  ngOnChanges(changes: {[propertyName: string]: SimpleChange}) {
    if (changes['clusterId'] || changes['rootPath']) {
      if (this.currentDirectory$) {
        this.currentDirectory$.next(this.rootPath);
      }
    }
  }

  handleSelectedAction(selected) {
    if (selected.length && 'pathSuffix' in selected[0]) {
      const currentDirectory = this.currentDirectory$.getValue();
      const pathSuffix = selected[0].pathSuffix;
      const prefix = currentDirectory === '/' ? '' : currentDirectory;
      if (pathSuffix !== '..') {
        this.selected = prefix + '/' + pathSuffix;
        this.select.emit(this.selected);
      }
    }
  }

  handleDoubleClickAction(row) {
    if (row.type === FILE_TYPES.DIRECTORY) {
      const currentDirectory = this.currentDirectory$.getValue();
      const prefix = currentDirectory === '/' ? '' : currentDirectory;
      let path = prefix + '/' + row.pathSuffix;
      if (row.pathSuffix === '..') {
        path = currentDirectory.replace(/\/[^/]*$/, '');
        path = path ? path : '/';
      }
      this.switchDirectory(path);
    }
  }

  updateBreadcrumbs(path: string): Breadcrumb[] {
    if (!path) {
      return [];
    }
    const pathArr = path.split('/');
    const breadcrumbsArr: Breadcrumb[] = [];
    while (pathArr.length - 1) {
      breadcrumbsArr.unshift({
        url: pathArr.join('/'),
        label: pathArr.pop()
      });
    }
    // Add root as the first element
    breadcrumbsArr.unshift({
      label: '/',
      url: '/'
    });
    // Remove url to not have hyperlink for the last element in breadcrumb
    breadcrumbsArr[breadcrumbsArr.length - 1].url = '';
    return breadcrumbsArr;
  }

  switchDirectory(path: string) {
    this.currentDirectory$.next(path);
    this.selected = path;
    this.select.emit(this.selected);
  }

  handleSortAction(event) {
    const rows = this.rows.filter(row => row.pathSuffix !== '..');
    const sort = event.sorts[0];
    rows.sort((a, b) => {
      if (a === null) { return 1; }
      if (b === null) { return -1; }
      if (a === null && b === null) { return 0; }
      if (isNaN(a[sort.prop])) {
        return a[sort.prop].toString().localeCompare(b[sort.prop].toString()) * (sort.dir === 'asc' ? 1 : -1);
      } else if (sort.prop === 'modificationTime') {
        const dateResult = <any>new Date(a[sort.prop]) - <any>new Date(b[sort.prop]);
        return (sort.dir === 'asc') ? dateResult : -dateResult;
      } else {
        const result = a[sort.prop] - b[sort.prop];
        return (sort.dir === 'asc') ? result : -result;
      }
    });
    const parent = this.currentDirectory$.getValue() === '/' ? [] : [<ListStatus>{pathSuffix: '..', type: FILE_TYPES.DIRECTORY}];
    this.rows = [...parent, ...rows];
  }

  convertPermissions(octal: string, type: string) {
    let permissions = type === FILE_TYPES.DIRECTORY ? 'd' : '-';
    this.getDigits(octal).map(digit => {
      permissions += this.getPermissionsString(+digit);
    });
    return permissions;
  }

  getPermissionsString(digit: number) {
    switch (digit) {
      case 1: return '--x';
      case 2: return '-w-';
      case 3: return '-wx';
      case 4: return 'r--';
      case 5: return 'r-x';
      case 6: return 'rw-';
      case 7: return 'rwx';
      case 0:
      default:
        return '---';
    }
  }

  getDigits(numberString: string) {
    return numberString.split('');
  }

  ngOnDestroy() {

  }
}
