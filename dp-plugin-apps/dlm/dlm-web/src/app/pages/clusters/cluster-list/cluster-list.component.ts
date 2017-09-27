/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

import { Component, OnInit, Input, ViewChild, TemplateRef, ViewEncapsulation, HostBinding,
  ChangeDetectorRef } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { BytesSizePipe } from 'pipes/bytes-size.pipe';
import { Router } from '@angular/router';
import { Cluster, ClusterAction } from 'models/cluster.model';
import { TableTheme } from 'common/table/table-theme.type';
import { TableComponent } from 'common/table/table.component';
import { ColumnMode } from '@swimlane/ngx-datatable';
import { CLUSTER_STATUS } from 'constants/status.constant';
import { ROOT_PATH } from 'constants/hdfs.constant';
import { ACTION_TYPES } from 'components/cluster-actions/cluster-actions.component';

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
  hdfsRootPath = ROOT_PATH;
  columnMode = ColumnMode.flex;
  isOpen = false;
  visibleActionMap = {};
  private selectedFileBrowserPage = {};
  clusterActions = [
    {
      label: this.t.instant('page.clusters.card.create_pair_text'),
      type: ACTION_TYPES.PAIRING
    },
    {
      label: this.t.instant('page.clusters.card.create_policy_text'),
      type: ACTION_TYPES.POLICY
    },
    {
      label: this.t.instant('page.clusters.card.launch_ambari'),
      type: ACTION_TYPES.AMBARI
    }
  ];
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

  constructor(private t: TranslateService,
              private cdRef: ChangeDetectorRef,
              private bytesPipe: BytesSizePipe,
              private router: Router) { }

  ngOnInit() {
    this.columns = [
      {prop: 'healthStatus', name: this.t.instant('common.status.self'), headerClass: 'status-header',
        cellTemplate: this.statusCellRef, flexGrow: 3, cellClass: 'status'},
      {prop: 'dataCenter', name: '', cellTemplate: this.dcCellRef, flexGrow: 3},
      {name: '', cellTemplate: this.slashIconCellRef, flexGrow: 1},
      {prop: 'name', name: '', cellTemplate: this.nameCellRef, flexGrow: 4},
      {prop: 'stats', name: this.t.instant('page.clusters.card.usage'), cellTemplate: this.usageCellRef, minWidth: 160, flexGrow: 5},
      {prop: 'totalHosts', name: this.t.instant('page.clusters.card.nodes'),
        cellTemplate: this.plainCellRef, qeAttrName: 'total-hosts', flexGrow: 1, cellClass: 'text-cell', headerClass: 'text-header'},
      {prop: 'pairsCounter', name: this.t.instant('common.pairs'),
        cellTemplate: this.plainCellRef, qeAttrName: 'total-pairs', flexGrow: 1, cellClass: 'text-cell', headerClass: 'text-header'},
      {prop: 'policiesCounter', name: this.t.instant('common.policies'),
        cellTemplate: this.plainCellRef, qeAttrName: 'total-policies', flexGrow: 2, cellClass: 'text-cell', headerClass: 'text-header'},
      {prop: 'location', name: this.t.instant('page.clusters.card.location'),
        cellTemplate: this.locationCellRef, flexGrow: 4},
      {name: '', cellTemplate: this.addActionsCellRef,
        cellClass: 'add-actions-cell', flexGrow: 1}
    ];
  }

  toggleClusterDetails(clusterRow) {
    this.toggleClusterContent(clusterRow);
    this.tableComponent.toggleRowDetail(clusterRow);
    this.cdRef.detectChanges();
  }

  private toggleClusterContent(clusterRow) {
    this.hdfsRootPath = ROOT_PATH;
  }

  handleOpenDirectory(path) {
    this.hdfsRootPath = path;
  }

  handleSelectedAction({cluster, action}) {
    switch (action.type) {
      case ACTION_TYPES.PAIRING:
        return this.router.navigate(['/pairings/create'], {queryParams: {'firstClusterId': cluster.id}});
      case ACTION_TYPES.POLICY:
        return this.router.navigate(['/policies/create'], {queryParams: {'sourceClusterId': cluster.id}});
      case ACTION_TYPES.AMBARI:
        window.open(cluster.ambariWebUrl, '_blank');
    }
  }

  handleActionOpenChange(event: {rowId: string, isOpen: boolean}) {
    const { rowId, isOpen } = event;
    if (rowId) {
      this.visibleActionMap[rowId] = isOpen;
    }
  }

  handleFileBrowserPageChange(event, rowId) {
    this.selectedFileBrowserPage[rowId] = event.offset;
  }

  shouldShowAction(rowId) {
    return rowId in this.visibleActionMap && this.visibleActionMap[rowId];
  }

  isExpandedRow(row: Cluster): boolean {
    return this.tableComponent.expandedRows[row.id];
  }

  getCapacityUsed(stats) {
    return (stats && stats.CapacityUsed) ? this.bytesPipe.transform(stats.CapacityUsed) : this.t.instant('common.na');
  }

  getCapacityTotal(stats) {
    return (stats && stats.CapacityTotal) ? this.bytesPipe.transform(stats.CapacityTotal) : this.t.instant('common.na');
  }

  getFileBrowserPageForRow(rowId) {
    return rowId && rowId in this.selectedFileBrowserPage ? this.selectedFileBrowserPage[rowId] : 0;
  }
}
