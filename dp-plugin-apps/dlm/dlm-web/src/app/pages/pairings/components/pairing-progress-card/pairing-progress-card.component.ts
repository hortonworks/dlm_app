/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

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
