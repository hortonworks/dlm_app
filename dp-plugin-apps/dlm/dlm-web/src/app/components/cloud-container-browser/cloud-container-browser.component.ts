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
import { TemplateRef } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Store } from '@ngrx/store';

import { getAllFilesForCloudPath } from 'selectors/cloud-container-item.selector';
import { getMergedProgress } from 'selectors/progress.selector';
import * as fromRoot from 'reducers';
import { loadContainerDir } from 'actions/cloud-container.action';
import { TableComponent } from 'common/table/table.component';
import { FILE_TYPES } from 'constants/cloud.constant';
import { Breadcrumb } from 'components/breadcrumb/breadcrumb.type';
import { isEqual } from 'utils/object-utils';
import { CloudContainer } from 'models/cloud-container.model';
import { CloudContainerItem } from 'models/cloud-container-item.model';

// TODO: this not scale well e.g. several components on the page
// skip this for a while, since we don't have such case for now
export const FILES_REQUEST = '[CLOUD CONTAINER] FILES_REQUEST';


// todo Combine with hdfs-browser?
@Component({
  selector: 'dlm-cloud-container-browser',
  styleUrls: ['./cloud-container-browser.component.scss'],
  encapsulation: ViewEncapsulation.None,
  template: `
    <dlm-cloud-container-browser-breadcrumb [breadcrumbs]="breadcrumbs$ | async" (onClick)="switchDirectory($event)">
    </dlm-cloud-container-browser-breadcrumb>
    <dlm-table
      #cloudFilesTable
      [columns]="columns"
      [rows]="rows$ | async"
      [offset]="page"
      [selectionType]="selectionType"
      [scrollbarV]="scrollbarV"
      [externalSorting]="externalSorting"
      [rowHeight]="rowHeight"
      [loadingIndicator]="(spinner$ | async)"
      (doubleClickAction)="handleDoubleClickAction($event)"
    >
    </dlm-table>
    <ng-template #nameFormattedTemplate let-value="value" let-row="row">
      <i *ngIf="row.pathSuffix !== '..'"
         [ngClass]="{'fa': true, 'fa-folder-o': row.type === fileTypes.DIRECTORY, 'fa-file-text-o': row.type !== fileTypes.DIRECTORY}"></i>
      <a *ngIf="row.type === fileTypes.DIRECTORY" class="nameLink" (click)="handleDoubleClickAction(row, $event)">
        <span *ngIf="row.pathSuffix !== '..'" [innerHTML]="value" style="padding-left: 5px;"></span>
        <i *ngIf="row.pathSuffix === '..'" class="fa fa-reply"></i>
      </a>
      <span *ngIf="row.type !== fileTypes.DIRECTORY" [innerHTML]="value" style="padding-left: 5px;"></span>
    </ng-template>
  `,
})
export class CloudContainerBrowserComponent implements OnInit, OnDestroy {
  private container$: BehaviorSubject<CloudContainer> = new BehaviorSubject(null);
  private currentDirectory$: BehaviorSubject<string> = new BehaviorSubject(null);

  @Input('container')
  set container(c: CloudContainer) {
    this.container$.next(c);
    this.currentDirectory$.next('/');
  }

  get container(): CloudContainer {
    return this.container$.getValue();
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

  @Output() select: EventEmitter<string> = new EventEmitter<string>();
  @Output() openDirectory = new EventEmitter<string>();
  @Output() changePage = new EventEmitter<any>();

  @HostBinding('class') componentClass = 'dlm-cloud-container-browser';
  @ViewChild('cloudFilesTable') jobsTable: TableComponent;
  @ViewChild('sizeFormattedTemplate') sizeFormattedTemplate: TemplateRef<any>;
  @ViewChild('dateTemplate') dateTemplate: TemplateRef<any>;
  @ViewChild('permissionsTemplate') permissionsTemplate: TemplateRef<any>;
  @ViewChild('nameFormattedTemplate') nameFormattedTemplate: TemplateRef<any>;

  breadcrumbs$: Observable<Breadcrumb[]>;
  rows$: Observable<CloudContainerItem[]>;
  rows: CloudContainerItem[] = [];
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
              private cdRef: ChangeDetectorRef) {
  }

  ngOnInit() {
    const requestProgress$ = this.store.select(getMergedProgress(FILES_REQUEST))
    // next line fixes zone.js error around change detection confusing
    // check https://github.com/angular/angular/issues/17572 for more info
      .do(_ => this.cdRef.detectChanges())
      .distinctUntilChanged(isEqual);
    const dataChanges$ = Observable.combineLatest(this.currentDirectory$, this.container$);
    const loadData$ = dataChanges$
      .distinctUntilChanged(isEqual)
      .subscribe(([path, container]) => {
        if (container) {
          this.store.dispatch(loadContainerDir(container, path, {container, path, requestId: FILES_REQUEST}));
        }
      });
    this.rows$ = dataChanges$
      .switchMap(([path, container]) => {
        return container ? this.store.select(getAllFilesForCloudPath(container.id, path)).map(files => {
          const parent = path === '/' ? [] : [<CloudContainerItem>{pathSuffix: '..', type: FILE_TYPES.DIRECTORY}];
          return [...parent, ...files];
        }) : [];
      });
    this.breadcrumbs$ = this.currentDirectory$.map(path => this.updateBreadcrumbs(path));
    this.spinner$ = Observable
      .combineLatest(this.rows$, requestProgress$.pluck('isInProgress'))
      .map(([rows, isInProgress]) => isInProgress && !rows.some(r => r.pathSuffix !== '..'));
    this.columns = [
      {
        prop: 'pathSuffix',
        name: 'Name',
        cellClass: 'text-cell',
        headerClass: 'text-header',
        minWidth: 150,
        sortable: false,
        flexGrow: 1,
        cellTemplate: this.nameFormattedTemplate
      }
    ];
    this.subscriptions.push(loadData$);
  }

  handleDoubleClickAction(row, e?) {
    if (e) {
      e.stopPropagation();
    }
    if (row.type === FILE_TYPES.DIRECTORY) {
      const currentDirectory = this.currentDirectory$.getValue();
      const prefix = currentDirectory === '/' ? '' : currentDirectory;
      let path = `${prefix}/${row.pathSuffix}/`;
      if (row.pathSuffix === '..') {
        path = currentDirectory;
        if (path.endsWith('/')) {
          path = path.substr(0, path.length - 1);
        }
        path = path.replace(/\/[^/]*$/, '');
        path = path ? path : '/';
      }
      path = path.replace(/\/+/g, '/');
      if (!path.endsWith('/')) {
        path = `${path}/`;
      }
      this.switchDirectory(path);
    }
  }

  updateBreadcrumbs(path: string): Breadcrumb[] {
    if (!path) {
      return [];
    }
    if (path.endsWith('/')) {
      path = path.substr(0, path.length - 1);
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
    this.select.emit(this.selected);
    this.openDirectory.emit(this.selected);
    this.changePage.emit({offset: this.page});
  }


  ngOnDestroy() {
    this.subscriptions.forEach(s => s.unsubscribe());
  }

}
