/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'dlm-cluster-legend',
  template: `
    <div class="map-legend-header">
      <span class="text-muted">{{cluster.name}}</span>
      <dlm-cluster-status-icon [cluster]="cluster" class="pull-right"></dlm-cluster-status-icon>
      <div class="clearfix"></div>
    </div>
    <div class="map-legend-body">
      <dl *ngIf="cluster?.alerts?.length">
        <dt>{{'page.overview.world_map.cluster_legend.alerts' | translate}}</dt>
        <dd *ngFor="let alert of cluster?.alerts">
          <i class="fa fa-exclamation-triangle text-danger"></i>
          {{alert.service_name}}
        </dd>
      </dl>
      <dl *ngIf="cluster?.alerts?.length" class="fix-alerts">
        <dt>{{'page.overview.world_map.cluster_legend.fix_alerts' | translate}}</dt>
          <dd>
            <a [href]="cluster.ambariurl" target="_blank">
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

  constructor() { }

  ngOnInit() {
  }

}
