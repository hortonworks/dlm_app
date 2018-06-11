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
  ChangeDetectionStrategy, Component, Input, OnInit, ViewChild, ViewEncapsulation, TemplateRef,
  ChangeDetectorRef
} from '@angular/core';
import {TranslateService} from '@ngx-translate/core';
import {TableComponent} from 'common/table/table.component';
import {Policy} from 'models/policy.model';
import {ColumnMode} from '@swimlane/ngx-datatable';
import {Router} from '@angular/router';
import {TableFooterOptions} from 'common/table/table-footer/table-footer.type';
import { TableTheme } from 'common/table/table-theme.type';

@Component({
  selector: 'dlm-cloud-account-policies-table',
  templateUrl: './cloud-account-policies-table.component.html',
  styleUrls: ['./cloud-account-policies-table.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CloudAccountsPoliciesTableComponent implements OnInit {
  @Input() policies: Policy[] = [];

  @ViewChild('verbStatusCellTemplate') verbStatusCellTemplate: TemplateRef<any>;
  @ViewChild('policyNameCellTemplate') policyNameCellTemplate: TemplateRef<any>;
  @ViewChild('prevJobsCellTemplate') prevJobsCellTemplate: TemplateRef<any>;
  @ViewChild('endTimeCellTemplate') endTimeCellTemplate: TemplateRef<any>;
  @ViewChild('lastJobTimeCellTemplate') lastJobTimeCellTemplate: TemplateRef<any>;
  columns = [];
  columnMode = ColumnMode.force;
  tableTheme = TableTheme.Transparent;

  tableFooterOptions = {
    showPageSizeMenu: false
  } as TableFooterOptions;

  constructor(private t: TranslateService, private cdRef: ChangeDetectorRef, private router: Router) {
  }

  ngOnInit() {
    this.columns = [
      TableComponent.paddingColumn(25),
      {
        prop: 'displayStatus',
        name: this.t.instant('common.status.self'),
        cellClass: 'text-cell',
        headerClass: 'text-header',
        cellTemplate: this.verbStatusCellTemplate
      },
      {
        prop: 'name',
        cellClass: 'text-cell',
        headerClass: 'text-header',
        name: this.t.instant('common.name'),
        cellTemplate: this.policyNameCellTemplate
      },
      {
        cellTemplate: this.prevJobsCellTemplate,
        cellClass: 'text-cell',
        headerClass: 'text-header',
        name: this.t.instant('page.jobs.prev_jobs'),
        sortable: false
      },
      TableComponent.paddingColumn(25)
    ];
  }

  goToPolicy(policy: Policy) {
    this.router.navigate(['/policies'], {queryParams: {policy: policy.name}});
  }
}
