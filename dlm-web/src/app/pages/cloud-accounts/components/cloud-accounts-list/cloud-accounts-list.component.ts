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

import {
  ChangeDetectionStrategy, Component, Input, OnInit, ViewChild, ViewEncapsulation, TemplateRef, HostBinding, EventEmitter, Output
} from '@angular/core';
import { ColumnMode } from '@swimlane/ngx-datatable';
import { CloudAccount, CloudAccountUI } from 'models/cloud-account.model';
import { TableTheme } from 'common/table/table-theme.type';
import { TranslateService } from '@ngx-translate/core';
import { TableComponent } from 'common/table/table.component';
import { ACTION_TYPES } from 'pages/cloud-accounts/components/cloud-account-actions/cloud-account-actions.component';
import { AWS_INSTANCEPROFILE, CLOUD_PROVIDER_LABELS, CREDENTIAL_ERROR_TYPES, CREDENTIAL_TYPES } from 'constants/cloud.constant';
import { hasUnexpiredPolicies, isOutOfSync, isUnregistered, hasError, isExpiredAccount } from 'utils/cloud-accounts-util';
import { SpinnerSize } from 'common/spinner';

@Component({
  selector: 'dlm-cloud-accounts-list',
  templateUrl: './cloud-accounts-list.component.html',
  styleUrls: ['./cloud-accounts-list.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CloudAccountsListComponent implements OnInit {

  AWS_INSTANCEPROFILE = AWS_INSTANCEPROFILE;
  CLOUD_PROVIDER_LABELS = CLOUD_PROVIDER_LABELS;

  @Output() removeAccount = new EventEmitter<CloudAccount>();
  @Output() editAccount = new EventEmitter<CloudAccount>();
  @Output() syncAccount = new EventEmitter<CloudAccount>();
  @Output() deleteUnregisteredAccount = new EventEmitter<CloudAccount>();

  @Input() accounts: CloudAccount[] = [];
  @Input() isSyncInProgress = false;

  @ViewChild(TableComponent) tableComponent: TableComponent;
  @ViewChild('providerCell') providerCellRef: TemplateRef<any>;
  @ViewChild('statusCell') statusCellRef: TemplateRef<any>;
  @ViewChild('policiesCell') policiesCellRef: TemplateRef<any>;
  @ViewChild('nameCell') nameCellRef: TemplateRef<any>;
  @ViewChild('actionsCell') actionsCellRef: TemplateRef<any>;

  @HostBinding('class') className = 'dlm-cloud-accounts-list';

  CREDENTIAL_ERROR_TYPES = CREDENTIAL_ERROR_TYPES;

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
  columnMode = ColumnMode.force;
  cloudAccountActions = [
    {
      label: this.t.instant('common.update'),
      type: ACTION_TYPES.EDIT
    },
    {
      label: this.t.instant('common.delete'),
      type: ACTION_TYPES.DELETE,
      disabled: (account) => hasUnexpiredPolicies(account),
      disabledMessage: 'page.cloud_stores.content.accounts.delete.expired_account_hint'
    }
  ];
  spinnerSize = SpinnerSize;
  isOutOfSync = isOutOfSync;
  isUnregistered = isUnregistered;
  hasUnexpiredPolicies = hasUnexpiredPolicies;
  isExpiredAccount = isExpiredAccount;
  hasError = hasError;

  private getAccountBody(account: CloudAccountUI): CloudAccount {
    return {
      id: account.id,
      accountDetails: account.accountDetails
    };
  }

  constructor(private t: TranslateService) {}

  ngOnInit() {
    this.columns = [
      {
        name: '',
        cellTemplate: this.providerCellRef,
        prop: 'accountDetails.provider',
        ...TableComponent.makeFixedWidth(60)
      },
      {
        name: '',
        cellTemplate: this.statusCellRef,
        cellClass: 'cloud-status-icon-cell',
        prop: 'status',
        ...TableComponent.makeFixedWidth(40)
      },
      {
        name: this.t.instant('page.cloud_stores.content.table.user_details'),
        cellTemplate: this.nameCellRef,
        sortable: false,
        ...TableComponent.makeFixedWidth(365)
      },
      {
        name: this.t.instant('page.cloud_stores.content.table.policies'),
        cellTemplate: this.policiesCellRef,
        sortable: false,
        ...TableComponent.makeFixedWidth(70)
      },
      {
        name: '',
        cellTemplate: this.actionsCellRef,
        cellClass: 'add-actions-cell',
        prop: 'containers.length',
        sortable: false,
        ...TableComponent.makeFixedWidth(50)
      }
    ];
  }

  getErrorType(account: CloudAccountUI): string {
    if (this.hasError(account)) {
      if (this.isExpiredAccount(account)) {
        return CREDENTIAL_ERROR_TYPES.INVALID;
      } else if (isOutOfSync(account)) {
        return CREDENTIAL_ERROR_TYPES.OUT_OF_SYNC;
      }
    }
    return '';
  }

  errorMessage(account: CloudAccountUI): string {
    if (this.hasError(account)) {
      if (this.isExpiredAccount(account)) {
        return this.t.instant('page.cloud_stores.content.accounts.expired_account');
      } else if (isOutOfSync(account)) {
        return this.t.instant('page.cloud_stores.content.accounts.out_of_sync_account', {
          clusters: account.clusters.filter(c => c.isInSync === false).length
        });
      }
      return '';
    }
    return '';
  }

  accountTypeMsg(account: CloudAccountUI): string {
    return  account.accountDetails.credentialType === CREDENTIAL_TYPES.WASB.WASB_ACCESSKEY ?
      this.t.instant('page.cloud_stores.content.accounts.wasb_storage_account') :
      this.t.instant('page.cloud_stores.content.accounts.aws_account_id');
  }

  rowClass = (account: CloudAccountUI): {[className: string]: boolean} => {
    return {
      'card-danger': this.hasError(account),
      'card-disabled': isUnregistered(account)
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
    this.syncAccount.emit(account.id);
  }

  deleteUnregistered(account) {
    if (hasUnexpiredPolicies(account)) {
      return;
    }
    this.deleteUnregisteredAccount.emit(this.getAccountBody(account));
  }
}
