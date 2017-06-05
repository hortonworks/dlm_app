import { Component, Input, Output, ViewEncapsulation, EventEmitter,
  ViewChild, HostBinding, OnInit, TemplateRef, SimpleChange, OnChanges } from '@angular/core';
import { ListStatus } from 'models/list-status.model';
import { Observable } from 'rxjs/Observable';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { Store } from '@ngrx/store';
import { getAllFilesForClusterPath } from 'selectors/hdfs.selector';
import * as fromRoot from 'reducers';
import { listFiles } from 'actions/hdfslist.action';
import { TableComponent } from 'common/table/table.component';
import { FILE_TYPES } from 'constants/hdfs.constant';

@Component({
  selector: 'dlm-hdfs-browser',
  styleUrls: ['./hdfs-browser.component.scss'],
  encapsulation: ViewEncapsulation.None,
  template: `
    <dlm-table
      #hdfsFilesTable
      [columns]="columns"
      [rows]="rows$ | async"
      [selectionType]="selectionType"
      (selectRowAction)="handleSelectedAction($event)"
      (doubleClickAction)="handleDoubleClickAction($event)"
    >
    </dlm-table>
    <ng-template #sizeFormattedTemplate let-value="value">
      <span *ngIf="value > 0" [innerHTML]="value | bytesSize"></span>
      <span *ngIf="value === 0">-</span>
    </ng-template>
    <ng-template #dateTemplate let-value="value">
      <span *ngIf="value > 0">{{value | amDateFormat:'YYYY-MM-DD HH:mm:ss'}}</span>
    </ng-template>
  `,
})
export class HdfsBrowserComponent implements OnInit, OnChanges {
  @Input() clusterId: number;
  @Input() rootPath: string;
  @Output() select: EventEmitter<string> = new EventEmitter<string>();
  @HostBinding('class') componentClass = 'dlm-hdfs-browser';
  @ViewChild('hdfsFilesTable') jobsTable: TableComponent;
  @ViewChild('sizeFormattedTemplate') sizeFormattedTemplate: TemplateRef<any>;
  @ViewChild('dateTemplate') dateTemplate: TemplateRef<any>;
  rows$: Observable<ListStatus[]>;
  currentDirectory$: BehaviorSubject<string>;
  columns: any = [];
  selectionType = 'single';
  selected: string;

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
    this.columns = [
      {prop: 'pathSuffix', name: 'Name', cellClass: 'text-cell', headerClass: 'text-header'},
      {prop: 'blockSize', name: 'Size', cellClass: 'text-cell', headerClass: 'text-header', cellTemplate: this.sizeFormattedTemplate},
      {prop: 'owner', name: 'Owner', cellClass: 'text-cell', headerClass: 'text-header'},
      {prop: 'group', name: 'Group', cellClass: 'text-cell', headerClass: 'text-header'},
      {prop: 'permission', name: 'Permission', cellClass: 'text-cell', headerClass: 'text-header'},
      {prop: 'modificationTime', name: 'Last Modified', cellClass: 'date-cell', headerClass: 'date-header', cellTemplate: this.dateTemplate}
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
      this.currentDirectory$.next(path);
      this.selected = path;
      this.select.emit(this.selected);
    }
  }
}
