import { Component, OnInit, Input } from '@angular/core';
import { Cluster } from '../../../models/cluster.model';

@Component({
  selector: 'dp-cluster-card',
  templateUrl: './cluster-card.component.html',
  styleUrls: ['./cluster-card.component.scss']
})
export class ClusterCardComponent implements OnInit {

  @Input()
  cluster: Cluster;

  constructor() { }

  ngOnInit() {
  }

}
