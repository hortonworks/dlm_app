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
