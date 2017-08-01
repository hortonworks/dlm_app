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
