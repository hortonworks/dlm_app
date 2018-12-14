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

import { Component, OnInit, Input, Output, EventEmitter, HostBinding, ViewEncapsulation, forwardRef } from '@angular/core';
import { HiveDatabase } from 'models/hive-database.model';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
import { HiveBrowserTablesLoadingMap, DatabaseTablesCollapsedEvent } from './hive-browser.type';
import { ProgressState } from 'models/progress-state.model';

export const HIVE_BROWSER_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  /* tslint:disable-next-line:no-use-before-declare */
  useExisting: forwardRef(() => HiveBrowserComponent),
  multi: true
};
@Component({
  selector: 'dlm-hive-browser',
  styleUrls: ['./hive-browser.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [HIVE_BROWSER_VALUE_ACCESSOR],
  template: `
    <div class="row" *ngIf="!databases?.length">
      <div class="col-xs-12">
        {{'hive_database.empty_selection' | translate}}
      </div>
    </div>
    <dlm-hive-database *ngFor="let database of databases; trackBy: trackByFn"
      (selectDatabase)="handleSelectDatabase($event)"
      (filterApplied)="handleFilterApplied($event)"
      (tablesCollapsed)="onTablesCollapsed(database, $event)"
      [tablesLoading]="getDatabaseTablesLoading(database)"
      [searchPattern]="searchPattern"
      [selectedDatabase]="selectedDB"
      [readonly]="readonly"
      [database]="database">
    </dlm-hive-database>
  `
})
export class HiveBrowserComponent implements OnInit, ControlValueAccessor {
  selectedDB = '';
  @Input() searchPattern = '';
  @Input() readonly = true;
  @Input() databases: HiveDatabase[] = [];
  @Input() tablesLoadingMap: HiveBrowserTablesLoadingMap = {};
  @Output() selectedDatabase = new EventEmitter<string>();
  @Output() filterApplied: EventEmitter<any> = new EventEmitter();
  @Output() databaseTablesCollapsed: EventEmitter<DatabaseTablesCollapsedEvent> = new EventEmitter();
  @HostBinding('class') className = 'dlm-hive-browser';

  onChange = (_: any) => {};

  get databaseNames(): string[] {
    return this.databases.map(database => database.name);
  }

  constructor() { }

  ngOnInit() {
  }

  selectDatabase(databaseName: string) {
    this.selectedDatabase.emit(databaseName);
  }

  writeValue(selectedDB: string) {
    this.selectedDB = selectedDB;
  }

  registerOnChange(onChange) {
    this.onChange = onChange;
  }

  registerOnTouched() {}

  handleSelectDatabase(databaseName: string) {
    this.selectedDB = databaseName;
    this.onChange(databaseName);
  }

  handleFilterApplied(event) {
    this.filterApplied.emit(event);
  }

  getDatabaseTablesLoading(database: HiveDatabase): ProgressState {
    const loadingMap = this.tablesLoadingMap || {};
    if (database) {
      return loadingMap[database.entityId];
    }
    return null;
  }

  onTablesCollapsed(database: HiveDatabase, collapsed: boolean): void {
    this.databaseTablesCollapsed.emit({database, collapsed});
  }

  trackByFn(i: HiveDatabase): string {
    return i.entityId;
  }
}
