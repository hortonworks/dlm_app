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
