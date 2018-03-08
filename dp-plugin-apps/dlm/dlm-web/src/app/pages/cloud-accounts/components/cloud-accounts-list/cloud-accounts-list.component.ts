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
  ChangeDetectorRef, HostBinding, EventEmitter, Output
} from '@angular/core';
import { ColumnMode } from '@swimlane/ngx-datatable';
import { CloudAccount, AccountStatus, CloudAccountUI } from 'models/cloud-account.model';
import { TableTheme } from 'common/table/table-theme.type';
import { TranslateService } from '@ngx-translate/core';
import { TableComponent } from 'common/table/table.component';
import { ACTION_TYPES } from 'pages/cloud-accounts/components/cloud-account-actions/cloud-account-actions.component';
import {IAM_ROLE, CLOUD_PROVIDER_LABELS} from 'constants/cloud.constant';

@Component({
  selector: 'dlm-cloud-accounts-list',
  templateUrl: './cloud-accounts-list.component.html',
  styleUrls: ['./cloud-accounts-list.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CloudAccountsListComponent implements OnInit {

  IAM_ROLE = IAM_ROLE;
  CLOUD_PROVIDER_LABELS = CLOUD_PROVIDER_LABELS;

  @Output() removeAccount = new EventEmitter<CloudAccount>();
  @Output() editAccount = new EventEmitter<CloudAccount>();
  @Output() syncAccount = new EventEmitter<CloudAccount>();
  @Output() deleteUnregisteredAccount = new EventEmitter<CloudAccount>();

  @Input() accounts: CloudAccount[] = [];

  @ViewChild(TableComponent) tableComponent: TableComponent;
  @ViewChild('providerCell') providerCellRef: TemplateRef<any>;
  @ViewChild('statusCell') statusCellRef: TemplateRef<any>;
  @ViewChild('policiesCell') policiesCellRef: TemplateRef<any>;
  @ViewChild('nameCell') nameCellRef: TemplateRef<any>;
  @ViewChild('actionsCell') actionsCellRef: TemplateRef<any>;

  @HostBinding('class') className = 'dlm-cloud-accounts-list';

  tableTheme = TableTheme.Cards;
  columns = [];
  footerHeight = 0;
  /**
   * should be enough for:
   * - table 5 rows + header each by ~38px
   * - details title ~40px
   */
  rowDetailHeight = 300; //
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

  private getAccountBody(account: CloudAccountUI): CloudAccount {
    return {
      id: account.id,
      accountDetails: account.accountDetails
    };
  }

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
        name: '',
        cellTemplate: this.statusCellRef,
        prop: 'status',
        flexGrow: 1
      },
      {
        name: this.t.instant('page.cloud_stores.content.table.user_details'),
        cellTemplate: this.nameCellRef,
        sortable: false,
        flexGrow: 10
      },
      {
        name: this.t.instant('page.cloud_stores.content.table.policies'),
        cellTemplate: this.policiesCellRef,
        sortable: false,
        flexGrow: 3
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

  isExpiredAccount(account: CloudAccountUI): boolean {
    return account.status === AccountStatus.Expired;
  }

  isOutOfSync({clusters = []}: CloudAccountUI): boolean {
    return clusters.some(cluster => cluster.isInSync === false);
  }

  isUnregistered(account: CloudAccountUI): boolean {
    return account.status === AccountStatus.Unregistered;
  }

  hasError(account: CloudAccountUI): boolean {
    return this.isExpiredAccount(account) || this.isOutOfSync(account);
  }

  errorMessage(account: CloudAccountUI): string {
    if (this.hasError(account)) {
      if (this.isExpiredAccount(account)) {
        return this.t.instant('page.cloud_stores.content.accounts.expired_account');
      } else if (this.isOutOfSync(account)) {
        return this.t.instant('page.cloud_stores.content.accounts.out_of_sync_account', {
          clusters: account.clusters.filter(c => c.isInSync === false).length
        });
      }
      return '';
    }
    return '';
  }

  rowClass = (account: CloudAccountUI): {[className: string]: boolean} => {
    return {
      'card-danger': this.hasError(account),
      'card-disabled': this.isUnregistered(account)
    };
  }

  isAccountActive(account) {
    return this.tableComponent.isRowExpanded(account);
  }

  toggleRowDetails(account) {
    this.tableComponent.toggleRowDetail(account);
  }

  handleSelectedAction({cloudAccount, action}: {cloudAccount: CloudAccountUI, action: any}) {
    const account: CloudAccount = this.getAccountBody(cloudAccount);
    switch (action.type) {
      case ACTION_TYPES.DELETE:
        this.removeAccount.emit(account);
        break;
      case ACTION_TYPES.EDIT:
        this.edit(cloudAccount);
        break;
      default:
    }
  }

  edit(account) {
    this.editAccount.emit(account);
  }

  sync(account) {
    this.syncAccount.emit(this.getAccountBody(account));
  }

  deleteUnregistered(account) {
    this.deleteUnregisteredAccount.emit(this.getAccountBody(account));
  }
}
