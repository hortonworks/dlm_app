import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ClustersStatus } from 'models/aggregations.model';
import { CLUSTERS_HEALTH_STATE } from '../resource-summary.type';

@Component({
  selector: 'dlm-clusters-summary',
  template: `
    <dlm-summary-panel [title]="'page.overview.summary_panels.title.clusters' | translate" [total]="data.total">
      <div class="row">
        <dlm-summary-panel-cell
          class="col-md-4"
          iconClass="fa fa-star text-success"
          [label]="'page.overview.summary_panels.status.healthy' | translate"
          [value]="data.healthy">
        </dlm-summary-panel-cell>
        <dlm-summary-panel-cell
          class="col-md-4"
          iconClass="fa fa-circle text-warning"
          qe-attr="show-clusters-warnings"
          (cellClick)="selectPanelCell.emit(healthStates.WARNING)"
          [actionable]="data.warning > 0"
          [label]="'page.overview.summary_panels.status.warning' | translate"
          [value]="data.warning">
        </dlm-summary-panel-cell>
        <dlm-summary-panel-cell
          class="col-md-4"
          iconClass="fa fa-exclamation-triangle text-danger"
          qe-attr="show-unhealthy-clusters"
          (cellClick)="selectPanelCell.emit(healthStates.UNHEALTHY)"
          [actionable]="data.unhealthy > 0"
          [label]="'page.overview.summary_panels.status.unhealthy' | translate"
          [value]="data.unhealthy">
        </dlm-summary-panel-cell>
      </div>
    </dlm-summary-panel>
  `,
  styleUrls: ['./clusters-summary.component.scss']
})
export class ClustersSummaryComponent implements OnInit {
  healthStates = CLUSTERS_HEALTH_STATE;

  @Input() data: ClustersStatus;
  @Output() selectPanelCell = new EventEmitter<any>();

  constructor() { }

  ngOnInit() {
  }
}
