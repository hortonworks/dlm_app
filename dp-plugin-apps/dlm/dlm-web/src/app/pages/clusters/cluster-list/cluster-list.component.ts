import { Component, OnInit, Input, ViewChild, TemplateRef, ViewEncapsulation, HostBinding } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Cluster } from 'models/cluster.model';
import { PoliciesCountEntity } from 'models/policies-count-entity.model';
import { PairsCountEntity } from 'models/pairs-count-entity.model';
import { TableTheme } from 'common/table/table-theme.type';
import { TableComponent } from 'common/table/table.component';

@Component({
  selector: 'dlm-cluster-list',
  templateUrl: './cluster-list.component.html',
  styleUrls: ['./cluster-list.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ClusterListComponent implements OnInit {
  tableTheme = TableTheme.Cards;
  columns = [];

  @Input() clusters: Cluster[];

  @ViewChild(TableComponent) tableComponent: TableComponent;
  // TODO: should use StatusColumnComponent instead. Currently cluster status is missed in API
  @ViewChild('statusCell') statusCellRef: TemplateRef<any>;
  @ViewChild('nameCell') nameCellRef: TemplateRef<any>;
  @ViewChild('usageCell') usageCellRef: TemplateRef<any>;
  @ViewChild('plainCell') plainCellRef: TemplateRef<any>;
  @ViewChild('locationCell') locationCellRef: TemplateRef<any>;
  @ViewChild('addActionsCell') addActionsCellRef: TemplateRef<any>;
  @ViewChild('rowDetailRef') rowDetailRef: TemplateRef<any>;

  @HostBinding('class') className = 'dlm-cluster-list';

  constructor(private t: TranslateService) { }

  ngOnInit() {
    this.columns = [
      {name: '', ...TableComponent.makeFixedWith(20)}, // just for padding
      {prop: 'status', name: this.t.instant('common.status.self'), cellTemplate: this.statusCellRef},
      {prop: 'name', name: '', cellTemplate: this.nameCellRef},
      {prop: 'stats', name: this.t.instant('page.clusters.card.usage'), cellTemplate: this.usageCellRef, minWidth: 200},
      {prop: 'totalHosts', name: this.t.instant('page.clusters.card.nodes'), cellTemplate: this.plainCellRef},
      {prop: 'pairsCounter', name: this.t.instant('common.pairs'), cellTemplate: this.plainCellRef},
      {prop: 'policiesCounter', name: this.t.instant('common.policies'), cellTemplate: this.plainCellRef},
      {prop: 'location', name: this.t.instant('page.clusters.card.location'), cellTemplate: this.locationCellRef },
      {name: '', cellTemplate: this.addActionsCellRef, ...TableComponent.makeFixedWith(230), cellClass: 'add-actions-cell'}
    ];
  }

  toggleClusterDetails(clusterRow) {
    this.tableComponent.toggleRowDetail(clusterRow);
  }
}
