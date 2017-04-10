import { Component, OnInit, Input } from '@angular/core';
import { Cluster } from '../../../models/cluster.model';

@Component({
  selector: 'dp-cluster-list',
  templateUrl: './cluster-list.component.html',
  styleUrls: ['./cluster-list.component.scss']
})
export class ClusterListComponent implements OnInit {

  @Input()
  clusters: Cluster[];

  constructor() { }

  ngOnInit() {
  }

}
