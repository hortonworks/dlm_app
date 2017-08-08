/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

import { Component, OnInit, Input, ViewChild, TemplateRef, ViewEncapsulation, HostBinding, ChangeDetectorRef } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Cluster } from 'models/cluster.model';
import { TableTheme } from 'common/table/table-theme.type';
import { TableComponent } from 'common/table/table.component';
import { ColumnMode } from '@swimlane/ngx-datatable';
import { CLUSTER_STATUS } from 'constants/status.constant';

@Component({
  selector: 'dlm-cluster-list',
  templateUrl: './cluster-list.component.html',
  styleUrls: ['./cluster-list.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ClusterListComponent implements OnInit {
  CLUSTER_STATUS = CLUSTER_STATUS;
  tableTheme = TableTheme.Cards;
  columns = [];
  hdfsRootPath = '/';
  columnMode = ColumnMode.flex;

  @Input() clusters: Cluster[];

  @ViewChild(TableComponent) tableComponent: TableComponent;
  // TODO: should use StatusColumnComponent instead. Currently cluster status is missed in API
  @ViewChild('statusCell') statusCellRef: TemplateRef<any>;
  @ViewChild('nameCell') nameCellRef: TemplateRef<any>;
  @ViewChild('dcCell') dcCellRef: TemplateRef<any>;
  @ViewChild('slashIconCell') slashIconCellRef: TemplateRef<any>;
  @ViewChild('usageCell') usageCellRef: TemplateRef<any>;
  @ViewChild('plainCell') plainCellRef: TemplateRef<any>;
  @ViewChild('locationCell') locationCellRef: TemplateRef<any>;
  @ViewChild('addActionsCell') addActionsCellRef: TemplateRef<any>;
  @ViewChild('rowDetailRef') rowDetailRef: TemplateRef<any>;

  @HostBinding('class') className = 'dlm-cluster-list';

  constructor(private t: TranslateService, private cdRef: ChangeDetectorRef) { }

  ngOnInit() {
    this.columns = [
      {prop: 'healthStatus', name: this.t.instant('common.status.self'), cellTemplate: this.statusCellRef,
        flexGrow: 3, cellClass: 'status'},
      {prop: 'dataCenter', name: '', cellTemplate: this.dcCellRef, flexGrow: 3},
      {name: '', cellTemplate: this.slashIconCellRef, flexGrow: 1},
      {prop: 'name', name: '', cellTemplate: this.nameCellRef, flexGrow: 4},
      {prop: 'stats', name: this.t.instant('page.clusters.card.usage'), cellTemplate: this.usageCellRef, minWidth: 160, flexGrow: 5},
      {prop: 'totalHosts', name: this.t.instant('page.clusters.card.nodes'),
        cellTemplate: this.plainCellRef, flexGrow: 1, cellClass: 'text-cell', headerClass: 'text-header'},
      {prop: 'pairsCounter', name: this.t.instant('common.pairs'),
        cellTemplate: this.plainCellRef, flexGrow: 1, cellClass: 'text-cell', headerClass: 'text-header'},
      {prop: 'policiesCounter', name: this.t.instant('common.policies'),
        cellTemplate: this.plainCellRef, flexGrow: 2, cellClass: 'text-cell', headerClass: 'text-header'},
      {prop: 'location', name: this.t.instant('page.clusters.card.location'),
        cellTemplate: this.locationCellRef, flexGrow: 4},
      {name: '', cellTemplate: this.addActionsCellRef, minWidth: 230,
        cellClass: 'add-actions-cell', flexGrow: 6}
    ];
  }

  toggleClusterDetails(clusterRow) {
    this.tableComponent.toggleRowDetail(clusterRow);
    this.cdRef.detectChanges();
  }
}
