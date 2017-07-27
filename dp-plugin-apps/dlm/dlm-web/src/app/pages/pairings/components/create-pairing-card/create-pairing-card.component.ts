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
