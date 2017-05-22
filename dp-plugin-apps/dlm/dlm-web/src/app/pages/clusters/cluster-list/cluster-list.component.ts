import { Component, OnInit, Input } from '@angular/core';
import { Cluster } from 'models/cluster.model';
import { PoliciesCountEntity } from 'models/policies-count-entity.model';
import { PairsCountEntity } from 'models/pairs-count-entity.model';

@Component({
  selector: 'dlm-cluster-list',
  templateUrl: './cluster-list.component.html',
  styleUrls: ['./cluster-list.component.scss']
})
export class ClusterListComponent implements OnInit {

  @Input() clusters: Cluster[];
  @Input() policiesCount: PoliciesCountEntity;
  @Input() pairsCount: PairsCountEntity;

  constructor() { }

  ngOnInit() {
  }

}
