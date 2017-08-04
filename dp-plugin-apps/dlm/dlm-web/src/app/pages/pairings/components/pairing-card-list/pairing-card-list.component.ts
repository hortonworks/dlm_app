/*
 * Copyright  (c) 2016-2017, Hortonworks Inc.  All rights reserved.
 *
 * Except as expressly permitted in a written agreement between you or your company
 * and Hortonworks, Inc. or an authorized affiliate or partner thereof, any use,
 * reproduction, modification, redistribution, sharing, lending or other exploitation
 * of all or any part of the contents of this software is strictly prohibited.
 */

import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Pairing } from '../../../../models/pairing.model';

@Component({
  selector: 'dlm-pairing-card-list',
  templateUrl: './pairing-card-list.component.html',
  styleUrls: ['./pairing-card-list.component.scss']
})
export class PairingCardListComponent implements OnInit {

  @Input() pairings: Pairing[];
  @Output() onUnpair: EventEmitter<Pairing> = new EventEmitter<Pairing>();

  constructor() { }

  ngOnInit() { }

  onListUnpair(pairing: Pairing) {
    this.onUnpair.emit(pairing);
  }
}
