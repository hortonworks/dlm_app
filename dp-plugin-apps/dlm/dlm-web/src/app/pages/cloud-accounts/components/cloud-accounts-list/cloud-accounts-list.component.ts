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
import { ACTION_TYPES } from 'pages/cloud-accounts/components/cloud-account-actions/cloud-account-actions.component';

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
  @ViewChild('providerCell') providerCellRef: TemplateRef<any>;
  @ViewChild('nameCell') nameCellRef: TemplateRef<any>;
  @ViewChild('actionsCell') actionsCellRef: TemplateRef<any>;

  tableTheme = TableTheme.Cards;
  columns = [];
  footerHeight = 0;
  showFooter = false;
  columnMode = ColumnMode.flex;
  cloudAccountActions = [
    {
      label: this.t.instant('common.edit'),
      type: ACTION_TYPES.EDIT
    },
    {
      label: this.t.instant('common.delete'),
      type: ACTION_TYPES.DELETE
    }
  ];

  constructor(private t: TranslateService, private cdRef: ChangeDetectorRef) {}

  ngOnInit() {
    this.columns = [
      {
        name: '',
        cellTemplate: this.providerCellRef,
        prop: 'accountDetails.provider',
        flexGrow: 3
      },
      {
        name: this.t.instant('page.cloud_stores.content.table.user_details'),
        cellTemplate: this.nameCellRef,
        sortable: false,
        flexGrow: 10
      },
      {
        name: this.t.instant('page.cloud_stores.content.table.actions'),
        cellTemplate: this.actionsCellRef,
        cellClass: 'add-actions-cell',
        prop: 'containers.length',
        sortable: false,
        flexGrow: 2
      }
    ];
  }

  handleSelectedAction({cluster, action}) {
    switch (action.type) {
      case ACTION_TYPES.DELETE:
        // TODO: Add action
      case ACTION_TYPES.EDIT:
        // TODO: Add action
    }
  }

}
