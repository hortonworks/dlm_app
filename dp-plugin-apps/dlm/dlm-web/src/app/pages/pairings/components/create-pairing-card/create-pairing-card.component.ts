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
import { BytesSizePipe } from 'pipes/bytes-size.pipe';

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
    return this.cluster.location.city + ', ' + this.cluster.location.country;
  }

  get capacityRemaining() {
    return (this.cluster && this.cluster.stats && this.cluster.stats.CapacityRemaining) ?
      this.bytesPipe.transform(this.cluster.stats.CapacityRemaining) : this.t.instant('common.na');
  }

  get isDisabled() {
    return this.cluster.disabled || this.cluster.ambariUnhealthy || this.cluster.beaconUnhealthy;
  }

  constructor(private t: TranslateService, private bytesPipe: BytesSizePipe) { }

  ngOnInit() {
  }

}
