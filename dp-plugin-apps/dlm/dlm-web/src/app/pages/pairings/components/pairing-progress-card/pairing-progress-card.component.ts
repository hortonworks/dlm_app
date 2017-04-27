import { Component, OnInit, Input } from '@angular/core';
import { Cluster } from '../../../../models/cluster.model';

@Component({
  selector: 'dlm-pairing-progress-card',
  templateUrl: './pairing-progress-card.component.html',
  styleUrls: ['./pairing-progress-card.component.scss']
})
export class PairingProgressCardComponent implements OnInit {

  @Input() firstCluster: Cluster;
  @Input() secondCluster: Cluster;

  constructor() { }

  ngOnInit() {
  }

}