import { Component, OnInit, Input } from '@angular/core';
import { Cluster } from 'models/cluster.model';
import { CLUSTER_STATUS } from 'constants/status.constant';

@Component({
  selector: 'dlm-cluster-status-icon',
  template: `
    <i class="fa fa-circle" [style.color]="cluster.healthStatus === CLUSTER_STATUS.HEALTHY ? '#1EB475' : '#EF6162'"></i>
  `,
  styleUrls: ['./cluster-status-icon.component.scss']
})
export class ClusterStatusIconComponent implements OnInit {
  CLUSTER_STATUS = CLUSTER_STATUS;

  @Input() cluster: Cluster;

  constructor() { }

  ngOnInit() {
  }

}
