import { Component, OnInit, Input } from '@angular/core';
import { ClusterPairing } from 'models/cluster-pairing.model';

@Component({
  selector: 'dlm-create-pairing-card',
  templateUrl: './create-pairing-card.component.html',
  styleUrls: ['./create-pairing-card.component.scss']
})
export class CreatePairingCardComponent implements OnInit {

  @Input() cluster: ClusterPairing;
  @Input() isSelected = false;
  @Input() isFrozen = false;

  constructor() { }

  ngOnInit() {
  }

}
