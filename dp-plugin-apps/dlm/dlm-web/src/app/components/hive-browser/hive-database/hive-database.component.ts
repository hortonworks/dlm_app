/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

import { Component, OnInit, Input, Output, ViewEncapsulation, HostBinding, EventEmitter } from '@angular/core';
import { HiveDatabase } from 'models/hive-database.model';
import { simpleSearch } from 'utils/string-utils';
import { ProgressState } from 'models/progress-state.model';

@Component({
  selector: 'dlm-hive-database',
  encapsulation: ViewEncapsulation.None,
  template: `
    <div class="row database-header">
      <div class="col-xs-12">
        <div class="database-header-inner">
          <div class="pull-left" (click)="onSelectDatabase()" *ngIf="!readonly">
            <div class="database-radio actionable">
              <input type="radio" [checked]="database?.name === selectedDatabase"/>
              <label class="radio"></label>
            </div>
          </div>
          <div class="pull-left">
            <span class="fa-stack fa-lg fa-stack-left database-name-stack">
              <i class="fa fa-lock" [hidden]="!database?.isEncrypted"></i>
              <i class="fa fa-database text-primary"></i>
            </span>
            <span class="database-name">{{database?.name}}</span>
          </div>
          <div class="pull-right">
            <dlm-search-input
              class="pull-left"
              *ngIf="readonly || !hideTables"
              [value]="searchPattern"
              (valueChange)="handleSearchChange($event)"
              ></dlm-search-input>
            <div class="col-xs-1" *ngIf="!readonly">
              <i class="fa text-primary"
                [ngClass]="{'fa-chevron-down': hideTables, 'fa-chevron-up': !hideTables}"
                (click)="toggleTables()"></i>
            </div>
          </div>
          <div class="clearfix"></div>
        </div>
      </div>
    </div>
    <div class="row database-tables-list" [collapse]="!readonly && hideTables">
      <dlm-progress-container [progressState]="tablesLoading">
        <div class="col-xs-12">
          <div class="row" *ngFor="let table of tables; let last = last">
            <div class="col-xs-12">
              <div [ngClass]="{'database-table': true, last: last}">
                <i class="fa fa-table"></i>
                <span>{{table?.name}}</span>
              </div>
            </div>
          </div>
          <div *ngIf="!tables.length" class="empty-tables">
            {{'hive_database.empty_tables' | translate}}
          </div>
        </div>
      </dlm-progress-container>
    </div>
  `,
  styleUrls: ['./hive-database.component.scss']
})
export class HiveDatabaseComponent implements OnInit {
  hideTables = true;

  @Input() searchPattern = '';
  @Input() selectedDatabase: string;
  @Input() database: HiveDatabase;
  @Input() readonly = true;
  @Input() tablesLoading: ProgressState = {isInProgress: true} as ProgressState;
  @HostBinding('class') className = 'dlm-hive-database';
  @Output() selectDatabase = new EventEmitter<string>();
  @Output() filterApplied: EventEmitter<any> = new EventEmitter();
  @Output() tablesCollapsed: EventEmitter<boolean> = new EventEmitter();

  get tables() {
    if (!this.database || !this.database.tables) {
      return [];
    }
    return this.database.tables.filter(table => simpleSearch(table.name, this.searchPattern));
  }

  constructor() { }

  ngOnInit() {
  }

  toggleTables(): void {
    this.hideTables = !this.hideTables;
    this.tablesCollapsed.emit(this.hideTables);
  }

  handleSearchChange(value) {
    this.searchPattern = value;
    this.filterApplied.emit(value);
  }

  onSelectDatabase() {
    this.selectDatabase.emit(this.database.name);
  }
}
