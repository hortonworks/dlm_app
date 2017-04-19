import { Component, OnInit, Input } from '@angular/core';
import { Cluster } from '../../../models/cluster.model';

@Component({
  selector: 'pairing-card',
  templateUrl: './pairing-card.component.html',
  styleUrls: ['./pairing-card.component.scss']
})
export class PairingCardComponent implements OnInit {

  @Input() cluster: Cluster;
  @Input() isSelected = false;

  constructor() { }

  ngOnInit() {
  }

}
