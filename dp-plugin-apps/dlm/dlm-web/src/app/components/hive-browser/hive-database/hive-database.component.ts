import { Component, OnInit, Input, Output, ViewEncapsulation, HostBinding, EventEmitter } from '@angular/core';
import { HiveDatabase } from 'models/hive-database.model';
import { simpleSearch } from 'utils/string-utils';

@Component({
  selector: 'dlm-hive-database',
  encapsulation: ViewEncapsulation.None,
  template: `
    <div class="row database-header">
      <div class="col-md-12">
        <div class="database-header-inner">
          <div class="pull-left" (click)="onSelectDatabase()" *ngIf="!readonly">
            <div class="database-radio actionable">
              <input type="radio" [checked]="database?.name === selectedDatabase"/>
              <label class="radio"></label>
            </div>
          </div>
          <div class="pull-left">
            <i class="fa fa-database"></i>
            <span class="database-name">{{database?.name}}</span>
          </div>
          <div class="pull-right">
            <dlm-search-input
              class="pull-left"
              *ngIf="readonly || !hideTables"
              (valueChange)="handleSearchChange($event)"
              ></dlm-search-input>
            <div class="col-md-1" *ngIf="!readonly">
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
      <div class="col-md-12">
        <div class="row" *ngFor="let table of tables; let last = last">
          <div class="col-md-12">
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
    </div>
  `,
  styleUrls: ['./hive-database.component.scss']
})
export class HiveDatabaseComponent implements OnInit {
  private searchPattern = '';
  hideTables = true;

  @Input() selectedDatabase: string;
  @Input() database: HiveDatabase;
  @Input() readonly = true;
  @HostBinding('class') className = 'dlm-hive-database';
  @Output() selectDatabase = new EventEmitter<string>();

  get tables() {
    if (!this.database || !this.database.tables.length) {
      return [];
    }
    return this.database.tables.filter(table => simpleSearch(table.name, this.searchPattern));
  }

  constructor() { }

  ngOnInit() {
  }

  toggleTables() {
    this.hideTables = !this.hideTables;
  }

  handleSearchChange(value) {
    this.searchPattern = value;
  }

  onSelectDatabase() {
    this.selectDatabase.emit(this.database.name);
  }
}
