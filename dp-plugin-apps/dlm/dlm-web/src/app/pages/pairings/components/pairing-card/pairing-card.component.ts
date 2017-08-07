/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Pairing } from 'models/pairing.model';

@Component({
  selector: 'dlm-pairing-card',
  templateUrl: './pairing-card.component.html',
  styleUrls: ['./pairing-card.component.scss']
})
export class PairingCardComponent implements OnInit {

  @Input() pairing: Pairing;
  @Output() onListUnpair: EventEmitter<Pairing> = new EventEmitter<Pairing>();

  get locations() {
    return [
      this.pairing.pair[0].location.city + ', ' + this.pairing.pair[0].location.country,
      this.pairing.pair[1].location.city + ', ' + this.pairing.pair[1].location.country
    ];
  }

  constructor() { }

  ngOnInit() {
  }

  onClickUnpair(pairing: Pairing) {
    this.onListUnpair.emit(pairing);
  }

}
