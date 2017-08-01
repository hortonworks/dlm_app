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
  @Input() isCompleted = false;

  get locations() {
    return [
      this.firstCluster.location.city + ', ' + this.firstCluster.location.country,
      this.secondCluster.location.city + ', ' + this.secondCluster.location.country
    ];
  }

  constructor() { }

  ngOnInit() {
  }

}
