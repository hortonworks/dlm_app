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

  constructor() { }

  ngOnInit() {
  }

  onClickUnpair(pairing: Pairing) {
    this.onListUnpair.emit(pairing);
  }

}
