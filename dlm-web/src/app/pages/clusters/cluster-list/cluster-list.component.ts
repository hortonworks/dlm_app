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
  Component, OnInit, Input, ViewChild, TemplateRef, ViewEncapsulation, HostBinding,
  ChangeDetectorRef,
  ChangeDetectionStrategy,
  OnDestroy
} from '@angular/core';
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
import { TableFooterOptions } from 'common/table/table-footer/table-footer.type';
import { Location } from 'models/location.model';
import { BeaconAdminStatus } from 'models/beacon-admin-status.model';
import { AvailableEntityActions } from 'selectors/operation.selector';

@Component({
  selector: 'dlm-cluster-list',
  templateUrl: './cluster-list.component.html',
  styleUrls: ['./cluster-list.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class ClusterListComponent implements OnInit {
  CLUSTER_STATUS = CLUSTER_STATUS;
  tableTheme = TableTheme.Cards;
  columns = [];
  hdfsRootPath = ROOT_PATH;
  columnMode = ColumnMode.flex;
  isOpen = false;
  tableFooterOptions = {
    pagerDropup: true
  } as TableFooterOptions;
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
  @Input() submittedClusters = {};
  @Input() availableActions: AvailableEntityActions;

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
      {prop: 'stats', name: this.t.instant('page.clusters.card.usage'), cellTemplate: this.usageCellRef,
        minWidth: 160, flexGrow: 5, comparator: this.clusterUsageComparator.bind(this)},
      {prop: 'totalHosts', name: this.t.instant('page.clusters.card.nodes'),
        cellTemplate: this.plainCellRef, qeAttrName: 'total-hosts', flexGrow: 1, cellClass: 'text-cell', headerClass: 'text-header'},
      {prop: 'pairsCounter', name: this.t.instant('common.pairs'),
        cellTemplate: this.plainCellRef, qeAttrName: 'total-pairs', flexGrow: 1, cellClass: 'text-cell', headerClass: 'text-header'},
      {prop: 'policiesCounter', name: this.t.instant('common.policies'),
        cellTemplate: this.plainCellRef, qeAttrName: 'total-policies', flexGrow: 2, cellClass: 'text-cell', headerClass: 'text-header'},
      {prop: 'location', name: this.t.instant('page.clusters.card.location'),
        cellTemplate: this.locationCellRef, comparator: this.clusterLocationComparator.bind(this), flexGrow: 4},
      {name: '', cellTemplate: this.addActionsCellRef,
        cellClass: 'add-actions-cell', flexGrow: 1}
    ];
  }

  clusterUsageComparator(stats1, stats2) {
    return this.getCapacityUsed(stats1) > this.getCapacityUsed(stats2) ? 1 : -1;
  }

  clusterLocationComparator(location1: Location, location2: Location) {
    return location1.city.toLowerCase() > location2.city.toLowerCase() ? 1 : -1;
  }

  toggleClusterDetails(clusterRow) {
    if (!this.isHDFSDisabled(clusterRow)) {
      this.toggleClusterContent(clusterRow);
      this.tableComponent.toggleRowDetail(clusterRow);
      this.cdRef.detectChanges();
    }
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

  handleFileBrowserPageChange(event, rowId) {
    this.selectedFileBrowserPage[rowId] = event.offset;
  }

  isHDFSDisabled(cluster): boolean {
    return !this.submittedClusters[cluster.id];
  }

  setStatsClass(cluster) {
    const isHdfsDisabled = this.isHDFSDisabled(cluster);
    return {
      disabled: isHdfsDisabled,
      'text-primary': !isHdfsDisabled,
      actionable: !isHdfsDisabled,
      'text-muted': isHdfsDisabled
    };
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
