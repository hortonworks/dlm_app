import { Component, OnInit, Input } from '@angular/core';
import { Cluster } from '../../../../models/cluster.model';

@Component({
  selector: 'dlm-create-pairing-card',
  templateUrl: './create-pairing-card.component.html',
  styleUrls: ['./create-pairing-card.component.scss']
})
export class CreatePairingCardComponent implements OnInit {

  @Input() cluster: Cluster;
  @Input() isSelected = false;

  constructor() { }

  ngOnInit() {
  }

}
