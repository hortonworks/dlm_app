/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

import {
    ChangeDetectorRef,
    Component,
    EventEmitter,
    HostBinding,
    Input,
    OnDestroy,
    OnInit,
    Output,
    ViewChild,
    ViewEncapsulation,
} from '@angular/core';
import { TemplateRef, SimpleChange, OnChanges } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Store } from '@ngrx/store';

import { ProgressState } from 'models/progress-state.model';
import { ListStatus } from 'models/list-status.model';
import { getAllFilesForClusterPath } from 'selectors/hdfs.selector';
import { getMergedProgress } from 'selectors/progress.selector';
import * as fromRoot from 'reducers';
import { listFiles } from 'actions/hdfslist.action';
import { TableComponent } from 'common/table/table.component';
import { FILE_TYPES } from 'constants/hdfs.constant';
import { Breadcrumb } from 'components/breadcrumb/breadcrumb.type';
import { HdfsService } from 'services/hdfs.service';
import { isEqual } from 'utils/object-utils';

// TODO: this not scale well e.g. several components on the page
// skip this for a while, since we don't have such case for now
export const FILES_REQUEST = '[HDFS Browser Component] FILES_REQUEST';

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
      [rows]="rows"
      [offset]="page"
      [selectionType]="selectionType"
      [scrollbarV]="scrollbarV"
      (selectRowAction)="handleSelectedAction($event)"
      [externalSorting]="externalSorting"
      [rowHeight]="rowHeight"
      [loadingIndicator]="(spinner$ | async)"
      (doubleClickAction)="handleDoubleClickAction($event)"
      (sortAction)="handleSortAction($event)"
      (pageChange)="handlePageChange($event)"
    >
    </dlm-table>
    <ng-template #nameFormattedTemplate let-value="value" let-row="row">
      <span class="fa fa-stack fa-lg fa-stack-left">
        <i class="fa fa-lock" [hidden]="!row.isEncrypted"></i>
        <i *ngIf="row.pathSuffix !== '..'"
        [ngClass]="{'fa': true, 'fa-folder-o': row.type === fileTypes.DIRECTORY, 'fa-file-text-o': row.type !== fileTypes.DIRECTORY}"></i>
      </span>
      <a *ngIf="row.type === fileTypes.DIRECTORY" class="nameLink" (click)="handleDoubleClickAction(row, $event)">
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
export class HdfsBrowserComponent implements OnInit, OnDestroy {
  private clusterId$: BehaviorSubject<number> = new BehaviorSubject(null);
  private currentDirectory$: BehaviorSubject<string> = new BehaviorSubject(null);
  @Input('clusterId')
  set clusterId(id: number) {
    this.clusterId$.next(id);
  }
  get clusterId(): number {
    return this.clusterId$.getValue();
  }

  @Input('rootPath')
  set rootPath(path: string) {
    this.currentDirectory$.next(path);
  }
  get rootPath(): string {
    return this.currentDirectory$.getValue();
  }

  /**
   * Select files won't emit value when set to `false`. Select files is turned off by default
   *
   * @type {boolean}
   */
  @Input() selectFiles = false;
  @Input() page = 0;

  @Output() selectFile: EventEmitter<string> = new EventEmitter<string>();
  @Output() openDirectory = new EventEmitter<string>();
  @Output() changePage = new EventEmitter<any>();

  @HostBinding('class') componentClass = 'dlm-hdfs-browser';
  @ViewChild('hdfsFilesTable') jobsTable: TableComponent;
  @ViewChild('sizeFormattedTemplate') sizeFormattedTemplate: TemplateRef<any>;
  @ViewChild('dateTemplate') dateTemplate: TemplateRef<any>;
  @ViewChild('permissionsTemplate') permissionsTemplate: TemplateRef<any>;
  @ViewChild('nameFormattedTemplate') nameFormattedTemplate: TemplateRef<any>;

  breadcrumbs$: Observable<Breadcrumb[]>;
  rows$: Observable<ListStatus[]>;
  rows: ListStatus[];
  spinner$: Observable<boolean>;
  columns: any = [];
  externalSorting = true;
  scrollbarV = false;
  selectionType = 'single';
  rowHeight = '35';
  selected: string;
  fileTypes = FILE_TYPES;
  subscriptions = [];

  constructor(private store: Store<fromRoot.State>,
              private hdfs: HdfsService,
              private cdRef: ChangeDetectorRef) {
  }

  ngOnInit() {
    const requestProgress$ = this.store.select(getMergedProgress(FILES_REQUEST))
      // next line fixes zone.js error aroun change detection confusing
      // check https://github.com/angular/angular/issues/17572 for more info
      .do(_ => this.cdRef.detectChanges())
      .distinctUntilChanged(isEqual);
    const dataChanges$ = Observable.combineLatest(this.currentDirectory$, this.clusterId$);
    const loadData$ = dataChanges$
      .distinctUntilChanged(isEqual)
      .subscribe(([path, clusterId]) => {
        this.store.dispatch(listFiles(clusterId, path, { clusterId: clusterId, path, requestId: FILES_REQUEST }));
      });
    this.rows$ = dataChanges$
      .switchMap(([path, clusterId]) => {
        return this.store.select(getAllFilesForClusterPath(clusterId, path)).map((files = []) => {
          const parent = path === '/' ? [] : [<ListStatus>{ pathSuffix: '..', type: FILE_TYPES.DIRECTORY }];
          return [...parent, ...files];
        });
      });
    this.breadcrumbs$ = this.currentDirectory$.map(path => this.updateBreadcrumbs(path));
    this.spinner$ = Observable.combineLatest(
      this.rows$,
      requestProgress$.pluck('isInProgress')
    ).map(([rows, isInProgress]) => {
      return isInProgress && !rows.some(r => r.pathSuffix !== '..');
    });
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
        cellTemplate: this.dateTemplate, maxWidth: 130},
      // empty column that fits to browser scroll width
      {prop: ' ', name: ' ', minWidth: 18, maxWidth: 18}
    ];
    this.subscriptions.push(loadData$);
    this.subscriptions.push(this.rows$.subscribe(rows => this.rows = rows));
  }

  handleSelectedAction(selected) {
    if (selected.length && 'pathSuffix' in selected[0]) {
      if (!this.selectFiles && selected[0].type === FILE_TYPES.FILE) {
        return;
      }
      const currentDirectory = this.currentDirectory$.getValue();
      const pathSuffix = selected[0].pathSuffix;
      const prefix = currentDirectory === '/' ? '' : currentDirectory;
      if (pathSuffix !== '..') {
        this.selected = prefix + '/' + pathSuffix;
        this.selectFile.emit(this.selected);
      }
    }
  }

  handleDoubleClickAction(row, e?) {
    if (e) {
      e.stopPropagation();
    }
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
    this.page = 0;
    this.selectFile.emit(this.selected);
    this.openDirectory.emit(this.selected);
    this.changePage.emit({offset: this.page});
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

  convertPermissions(permission: string, type: string) {
    const fileType = type === FILE_TYPES.DIRECTORY ? 'd' : '-';
    return `${fileType}${permission}`;
  }

  ngOnDestroy() {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

  handlePageChange(page) {
    this.changePage.emit(page);
  }
}
