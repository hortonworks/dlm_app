/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

import { Component, OnInit, Input } from '@angular/core';
import { ClusterPairing } from 'models/cluster-pairing.model';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'dlm-create-pairing-card',
  templateUrl: './create-pairing-card.component.html',
  styleUrls: ['./create-pairing-card.component.scss']
})
export class CreatePairingCardComponent implements OnInit {

  @Input() cluster: ClusterPairing;
  @Input() isSelected = false;
  @Input() isFrozen = false;

  get location() {
    return this.cluster.disabled ? '' : this.cluster.location.city + ', ' + this.cluster.location.country;
  }

  get tooltip() {
    return this.cluster.disabled ? this.t.instant('page.pairings.create.content.cluster_disabled') : '';
  }

  constructor(private t: TranslateService) { }

  ngOnInit() {
  }

}
