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
