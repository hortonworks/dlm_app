/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

import {
  ChangeDetectionStrategy, Component, Input, OnInit, ViewChild, ViewEncapsulation, TemplateRef,
  ChangeDetectorRef
} from '@angular/core';
import { CloudAccount } from 'models/cloud-account.model';
import { ColumnMode } from '@swimlane/ngx-datatable/release';
import { TableTheme } from 'common/table/table-theme.type';
import { TranslateService } from '@ngx-translate/core';
import { TableComponent } from 'common/table/table.component';
import { CloudContainer } from '../../../models/cloud-container.model';

@Component({
  selector: 'dlm-cloud-accounts-list',
  templateUrl: './cloud-accounts-list.component.html',
  styleUrls: ['./cloud-accounts-list.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CloudAccountsListComponent implements OnInit {

  @Input() accounts: CloudAccount[] = [];

  @ViewChild(TableComponent) tableComponent: TableComponent;
  @ViewChild('nameCell') nameCellRef: TemplateRef<any>;
  @ViewChild('rowDetailRef') rowDetailRef: TemplateRef<any>;
  @ViewChild('backetsCell') backetsCellRef: TemplateRef<any>;

  tableTheme = TableTheme.Cards;
  columns = [];
  columnMode = ColumnMode.flex;

  selectedContainer: CloudContainer;

  constructor(private t: TranslateService, private cdRef: ChangeDetectorRef) {

  }

  ngOnInit() {
    this.columns = [
      {prop: 'id', flexGrow: 15},
      {
        name: this.t.instant('page.cloud_stores.content.table.user_details'),
        cellTemplate: this.nameCellRef,
        sortable: false,
        flexGrow: 10
      },
      {
        name: this.t.instant('page.cloud_stores.content.table.buckets_count'),
        cellTemplate: this.backetsCellRef,
        prop: 'containers.length',
        flexGrow: 3
      }
    ];
  }

  toggleBacketDetails(clusterRow) {
    this.tableComponent.toggleRowDetail(clusterRow);
    this.selectedContainer = clusterRow.containers[0];
    this.cdRef.detectChanges();
  }

  selectContainer(container) {
    this.selectedContainer = container;
  }

}
