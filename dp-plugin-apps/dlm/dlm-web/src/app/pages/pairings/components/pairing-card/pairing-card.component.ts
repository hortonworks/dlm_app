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
