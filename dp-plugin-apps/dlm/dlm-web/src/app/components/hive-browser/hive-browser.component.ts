/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

import { Component, OnInit, Input, Output, EventEmitter, HostBinding, ViewEncapsulation, forwardRef } from '@angular/core';
import { HiveDatabase } from 'models/hive-database.model';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';

export const HIVE_BROWSER_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => HiveBrowserComponent),
  multi: true
};
@Component({
  selector: 'dlm-hive-browser',
  styleUrls: ['./hive-browser.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [HIVE_BROWSER_VALUE_ACCESSOR],
  template: `
    <div class="row" *ngIf="!databases.length">
      <div class="col-md-12">
        {{'hive_database.empty_selection' | translate}}
      </div>
    </div>
    <dlm-hive-database *ngFor="let database of databases"
      (selectDatabase)="handleSelectDatabase($event)"
      [selectedDatabase]="selectedDB"
      [readonly]="readonly"
      [database]="database">
    </dlm-hive-database>
  `
})
export class HiveBrowserComponent implements OnInit, ControlValueAccessor {
  selectedDB = '';
  @Input() readonly = true;
  @Input() databases: HiveDatabase[] = [];
  @Output() selectedDatabase = new EventEmitter<string>();
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
}
