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


import {combineLatest as observableCombineLatest,  Observable, BehaviorSubject } from 'rxjs';

import {pluck, tap, distinctUntilChanged, switchMap, map, filter} from 'rxjs/operators';
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
import { TemplateRef } from '@angular/core';
import { Store } from '@ngrx/store';

import { ListStatus } from 'models/list-status.model';
import { getAllFilesForClusterPath } from 'selectors/hdfs.selector';
import { getMergedProgress } from 'selectors/progress.selector';
import * as fromRoot from 'reducers';
import { listFiles } from 'actions/hdfslist.action';
import { TableComponent } from 'common/table/table.component';
import { FILE_TYPES } from 'constants/hdfs.constant';
import { Breadcrumb } from 'components/breadcrumb/breadcrumb.type';
import { isEqual } from 'utils/object-utils';
import { Cluster } from 'models/cluster.model';
import { NOTIFICATION_CONTENT_TYPE, NOTIFICATION_TYPES } from 'constants/notification.constant';
import { TranslateService } from '@ngx-translate/core';
import { FeatureService } from 'services/feature.service';
import { HDFS_FILTER } from 'models/features.model';

// TODO: this not scale well e.g. several components on the page
// skip this for a while, since we don't have such case for now
export const FILES_REQUEST = '[HDFS Browser Component] FILES_REQUEST';

@Component({
  selector: 'dlm-hdfs-browser',
  styleUrls: ['./hdfs-browser.component.scss'],
  encapsulation: ViewEncapsulation.None,
  template: `
    <dlm-hdfs-browser-breadcrumb [breadcrumbs]="breadcrumbs$ | async" [clusterName]="cluster.name" (onClick)="switchDirectory($event)">
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
      [loadingIndicator]="(spinner$ | async)"
      (doubleClickAction)="handleDoubleClickAction($event)"
      (sortAction)="handleSortAction($event)"
      (pageChange)="handlePageChange($event)"
    >
    </dlm-table>
    <ng-template #nameFormattedTemplate let-value="value" let-row="row">
      <span class="file-icon">
        <span class="fa fa-stack fa-fw fa-stack-left">
          <i class="fa fa-lock" [hidden]="!row.isEncrypted"></i>
          <i *ngIf="row.pathSuffix !== '..'"
          [ngClass]="{'fa': true, 'fa-folder-o': row.type === fileTypes.DIRECTORY, 'fa-file-text-o': row.type !== fileTypes.DIRECTORY}"></i>
        </span>
      </span>
      <a *ngIf="row.type === fileTypes.DIRECTORY" class="nameLink" (click)="handleDoubleClickAction(row, $event)">
        <span *ngIf="row.pathSuffix !== '..'" [innerHTML]="value" [tooltip]="value" placement="right" style="padding-left: 5px;"></span>
        <i *ngIf="row.pathSuffix === '..'" class="fa fa-reply"></i>
      </a>
      <span *ngIf="row.type !== fileTypes.DIRECTORY" [innerHTML]="value" [tooltip]="value" style="padding-left: 5px;"></span>
    </ng-template>
    <ng-template #sizeFormattedTemplate let-value="value">
      <span *ngIf="value > 0" [innerHTML]="value | bytesSize"></span>
      <span *ngIf="value === 0">- -</span>
    </ng-template>
    <ng-template #dateTemplate let-value="value">
      <span *ngIf="value > 0" [tooltip]="value | amDateFormat:'YYYY-MM-DD HH:mm:ss'" placement="left">
        {{value | amDateFormat:'YYYY-MM-DD HH:mm:ss'}}
      </span>
    </ng-template>
    <ng-template #permissionsTemplate let-value="value" let-row="row">
      <span *ngIf="value" [innerHTML]="convertPermissions(value, row.type)"></span>
    </ng-template>
    <ng-template #snapshottableTemplate let-value="value">
      <span *ngIf="value" class="fa fa-files-o"></span>
    </ng-template>
  `,
})
export class HdfsBrowserComponent implements OnInit, OnDestroy {
  private cluster$: BehaviorSubject<Cluster> = new BehaviorSubject(null);
  private currentDirectory$: BehaviorSubject<string> = new BehaviorSubject(null);
  private initialRootPath = null;

  @Input('cluster')
  set cluster(clust: Cluster) {
    this.cluster$.next(clust);
  }
  get cluster(): Cluster {
    return this.cluster$.getValue();
  }

  @Input('rootPath')
  set rootPath(path: string) {
    this.currentDirectory$.next(path);
    if (this.initialRootPath === null && path) {
      this.initialRootPath = path;
    }
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

  /**
   * Disallow to traverse over `hdfsRootPath`
   *
   * @type {boolean}
   */
  @Input() restrictAboveRootPath = false;

  /**
   * Determines if notification about failed requests should be shown
   * This value is used together with `featureService.isEnabled(HDFS_FILTER)`.
   *
   * @type {boolean}
   */
  @Input() showNotificationError = true;

  get showNotificationErrorInternal() {
    if (this.featureService.isEnabled(HDFS_FILTER)) {
      return false;
    }
    return this.showNotificationError;
  }

  @Output() selectFile: EventEmitter<string> = new EventEmitter<string>();
  @Output() openDirectory = new EventEmitter<string>();
  @Output() changePage = new EventEmitter<any>();

  @HostBinding('class') componentClass = 'dlm-hdfs-browser';
  @ViewChild('hdfsFilesTable') jobsTable: TableComponent;
  @ViewChild('sizeFormattedTemplate') sizeFormattedTemplate: TemplateRef<any>;
  @ViewChild('dateTemplate') dateTemplate: TemplateRef<any>;
  @ViewChild('permissionsTemplate') permissionsTemplate: TemplateRef<any>;
  @ViewChild('nameFormattedTemplate') nameFormattedTemplate: TemplateRef<any>;
  @ViewChild('snapshottableTemplate') snapshottableTemplate: TemplateRef<any>;

  breadcrumbs$: Observable<Breadcrumb[]>;
  rows$: Observable<ListStatus[]>;
  rows: ListStatus[];
  spinner$: Observable<boolean>;
  columns: any = [];
  externalSorting = true;
  scrollbarV = false;
  selectionType = 'single';
  selected: string;
  fileTypes = FILE_TYPES;
  subscriptions = [];

  constructor(private store: Store<fromRoot.State>,
              private cdRef: ChangeDetectorRef,
              private t: TranslateService,
              private featureService: FeatureService) {
  }

  ngOnInit() {
    const requestProgress$ = this.store.select(getMergedProgress(FILES_REQUEST)).pipe(
      // next line fixes zone.js error around change detection confusing
      // check https://github.com/angular/angular/issues/17572 for more info
      tap(_ => this.cdRef.detectChanges()),
      distinctUntilChanged(isEqual), );
    const dataChanges$ = observableCombineLatest(this.currentDirectory$, this.cluster$);
    const loadData$ = dataChanges$.pipe(
      distinctUntilChanged(isEqual))
      .subscribe(([path, cluster]) => {
        this.store.dispatch(listFiles(cluster.id, path, {
          clusterId: cluster.id,
          path,
          requestId: FILES_REQUEST,
          notification: this.showNotificationErrorInternal ? {
            [NOTIFICATION_TYPES.ERROR]: {
              title: this.t.instant('hdfs_filebrowser.notifications.error.title'),
              contentType: NOTIFICATION_CONTENT_TYPE.MODAL_LINK
            },
            levels: [NOTIFICATION_TYPES.ERROR]
          } : null
        }));
        this.initColumns();
      });
    this.rows$ = dataChanges$.pipe(
      switchMap(([path, cluster]) => {
        return this.store.select(getAllFilesForClusterPath(cluster.id, path)).pipe(map((files = []) => {
          const parentFullPath = files.length ? files[0].parentFullPath : '';
          const parent = (path === '/' || this.restrictAboveRootPath && path === this.initialRootPath) ? [] :
            [<ListStatus>{ pathSuffix: '..', type: FILE_TYPES.DIRECTORY, parentFullPath }];
          return [...parent, ...files];
        }));
      }));
    this.breadcrumbs$ = this.currentDirectory$.pipe(map(path => this.updateBreadcrumbs(path)));
    this.spinner$ = observableCombineLatest(
      this.rows$,
      requestProgress$.pipe(pluck('isInProgress'))
    ).pipe(map(([rows, isInProgress]) => {
      return isInProgress && !rows.some(r => r.pathSuffix !== '..');
    }));
    const redrawTable = requestProgress$.pipe(filter((progressState) => progressState.isInProgress === false))
      .subscribe(() => this.jobsTable.recalculateTable());
    this.initColumns();
    this.subscriptions.push(redrawTable);
    this.subscriptions.push(loadData$);
    this.subscriptions.push(this.rows$.subscribe(rows => this.rows = rows));
  }

  initColumns() {
    // Adding or removing columns before the "snapshottable" column will require changes
    // to the "columns.splice" logic below to handle "enableUseSourceSnapshots" feature
    this.columns = [
      {prop: 'pathSuffix', name: 'Name', cellClass: 'text-cell', headerClass: 'text-header',
        minWidth: 150, flexGrow: 1, cellTemplate: this.nameFormattedTemplate},
      {prop: 'length', name: 'Size', cellClass: 'text-cell', headerClass: 'text-header',
        cellTemplate: this.sizeFormattedTemplate, maxWidth: 120},
      {
        prop: 'snapshottable',
        cellClass: 'text-cell',
        headerClass: 'text-header',
        cellTemplate: this.snapshottableTemplate,
        name: 'Snapshot Ready',
        ...TableComponent.makeFixedWidth(95)
      },
      {prop: 'owner', name: 'Owner', cellClass: 'text-cell', headerClass: 'text-header', maxWidth: 150},
      {prop: 'group', name: 'Group', cellClass: 'text-cell', headerClass: 'text-header', maxWidth: 150},
      {prop: 'permission', name: 'Permission', cellClass: 'text-cell',
        headerClass: 'text-header', cellTemplate: this.permissionsTemplate, sortable: false, maxWidth: 120},
      {prop: 'modificationTime', name: 'Last Modified', cellClass: 'date-cell', headerClass: 'date-header',
        cellTemplate: this.dateTemplate, maxWidth: 130},
      // empty column that fits to browser scroll width
      {prop: ' ', name: ' ', ...TableComponent.makeFixedWidth(18)}
    ];
    // If the cluster doesn't support "enableUseSourceSnapshots" feature, then remove that column
    if (this.cluster && this.cluster.beaconAdminStatus) {
      const {beaconAdminStatus: {enableSnapshotBasedReplication}} = this.cluster.beaconAdminStatus;
      if (!enableSnapshotBasedReplication) {
        this.columns.splice(2, 1);
      }
    } else {
      this.columns.splice(2, 1);
    }
  }

  handleSelectedAction(selected) {
    if (selected.length && 'pathSuffix' in selected[0]) {
      if (!this.selectFiles && selected[0].type === FILE_TYPES.FILE) {
        return;
      }
      const pathSuffix = selected[0].pathSuffix;
      const path = this.getPath(pathSuffix);
      if (pathSuffix !== '..') {
        this.selected = path;
        this.selectFile.emit(this.selected);
      }
    }
  }

  handleDoubleClickAction(row, e?) {
    if (e) {
      e.stopPropagation();
    }
    if (row.type === FILE_TYPES.DIRECTORY) {
      let path = '';
      const currentDirectory = this.currentDirectory$.getValue();
      if (row.parentFullPath) {
        if (row.pathSuffix === '..') {
          path = row.parentFullPath.split('/').slice(0, -1).join('/') || '/';
        } else {
          path = `${row.parentFullPath}/${row.pathSuffix}`.replace(/\/\//g, '/');
        }
      } else {
        path = this.getPath(row.pathSuffix);
        if (row.pathSuffix === '..') {
          path = currentDirectory.replace(/\/[^/]*$/, '');
          path = path ? path : '/';
        }
      }
      this.switchDirectory(path);
    }
  }

  getPath(pathSuffix) {
    const currentDirectory = this.currentDirectory$.getValue();
    const prefix = currentDirectory === '/' ? '' : currentDirectory;
    const trailingSlash = prefix && currentDirectory.charAt(currentDirectory.length - 1) === '/' ? '' : '/';
    return prefix + trailingSlash + pathSuffix;
  }

  updateBreadcrumbs(path: string): Breadcrumb[] {
    if (!path) {
      return [];
    }
    const pathArr = path.split('/');
    const breadcrumbsArr: Breadcrumb[] = [];
    while (pathArr.length - 1) {
      // Restrict the user from switching to parent directories
      const urlPath = pathArr.join('/');
      const url = this.restrictAboveRootPath && !urlPath.startsWith(this.initialRootPath) ? '' : urlPath;
      breadcrumbsArr.unshift({
        url,
        label: pathArr.pop()
      });
    }
    // Add root as the first element
    breadcrumbsArr.unshift({
      label: '/',
      url: this.restrictAboveRootPath ? '' : '/'
    });
    // Remove url to not have hyperlink for the last element in breadcrumb
    breadcrumbsArr[breadcrumbsArr.length - 1].url = '';
    return breadcrumbsArr;
  }

  switchDirectory(path: string) {
    // Restrict the user from switching to parent directories
    if (this.restrictAboveRootPath && !path.startsWith(this.initialRootPath)) {
      return false;
    }
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
