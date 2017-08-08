/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

import { Component, OnInit, Input } from '@angular/core';
import { Cluster } from 'models/cluster.model';
import { CLUSTER_STATUS_COLOR } from 'constants/color.constant';

@Component({
  selector: 'dlm-cluster-status-icon',
  template: `
    <i class="fa fa-circle" [style.color]="CLUSTER_STATUS_COLOR[cluster.healthStatus]"></i>
  `,
  styleUrls: ['./cluster-status-icon.component.scss']
})
export class ClusterStatusIconComponent implements OnInit {
  CLUSTER_STATUS_COLOR = CLUSTER_STATUS_COLOR;

  @Input() cluster: Cluster;

  constructor() { }

  ngOnInit() {
  }

}
