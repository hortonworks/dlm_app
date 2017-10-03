/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CLUSTER_STATUS } from 'constants/status.constant';

@Component({
  selector: 'dlm-cluster-legend',
  template: `
    <div class="map-legend-header">
      <div class="pull-left">
        <dlm-cluster-status-icon class="pull-left" [cluster]="cluster"></dlm-cluster-status-icon>
        <div class="pull-left cluster-name">{{cluster.name}}</div>
      </div>
      <div class="pull-right">
        <button qe-attr="map-legend-cross" class="cross-button close" type="button" aria-label="Close" (click)="onClickClose()">
          <span aria-hidden="true">&times;</span>
        </button>
      </div>
      <div class="clearfix"></div>
    </div>
    <div class="map-legend-body">
      <dl *ngIf="shouldShowAlertsSection">
        <dt>{{'page.overview.world_map.cluster_legend.alerts' | translate}}</dt>
        <dd *ngFor="let alert of cluster?.alerts">
          <dlm-service-status-icon [serviceStatus]="alert"></dlm-service-status-icon>
          {{alert.service_name}}
        </dd>
        <dd *ngIf="isAmbariServerStopped">
          <i class="fa fa-exclamation-triangle text-danger"></i>
          {{'common.services.ambari_server' | translate}}
        </dd>
      </dl>
      <dl class="fix-alerts">
        <dt>{{'page.overview.world_map.cluster_legend.manage_ambari' | translate}}</dt>
        <dd>
          <a [href]="cluster.ambariWebUrl" target="_blank">
            {{'page.overview.world_map.cluster_legend.launch_ambari' | translate}}
          </a>
        </dd>
      </dl>
      <dl>
        <dt>{{'common.policies' | translate}}</dt>
        <dd>{{cluster.policiesCounter}}</dd>
      </dl>
    </div>
  `,
  styleUrls: ['./cluster-legend.component.scss']
})
export class ClusterLegendComponent implements OnInit {

  @Input() cluster: any;
  @Output() onClose: EventEmitter<boolean> = new EventEmitter<boolean>();

  get shouldShowAlertsSection(): boolean {
    return this.cluster && (this.cluster.alerts && this.cluster.alerts.length
     || this.cluster.healthStatus === CLUSTER_STATUS.UNKNOWN);
  }

  get isAmbariServerStopped(): boolean {
    return this.cluster && this.cluster.healthStatus === CLUSTER_STATUS.UNKNOWN;
  }

  constructor() { }

  ngOnInit() {
  }

  onClickClose() {
    this.onClose.emit(true);
  }
}
