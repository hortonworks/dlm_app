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
