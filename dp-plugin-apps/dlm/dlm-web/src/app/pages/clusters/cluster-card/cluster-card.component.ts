import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';
import { Cluster } from 'models/cluster.model';
import { PoliciesCountEntity } from 'models/policies-count-entity.model';
import { PairsCountEntity } from 'models/pairs-count-entity.model';
import { Store } from '@ngrx/store';
import { State } from 'reducers';

@Component({
  selector: 'dlm-cluster-page-card',
  templateUrl: './cluster-card.component.html',
  styleUrls: ['./cluster-card.component.scss']
})
export class ClusterCardComponent implements OnInit {

  @Input() cluster: Cluster;
  @Input() policiesCount: PoliciesCountEntity;
  @Input() pairsCount: PairsCountEntity;
  @Input() clustersCount: number;

  showButtons = false;

  constructor(private store: Store<State>, private router: Router) { }

  ngOnInit() {
  }

  /**
   * Handle onMouseover event on "+" button div
   */
  onMouseEnter() {
    this.showButtons = true;
  }

  onMouseLeave() {
    this.showButtons = false;
  }

  createPairingClickHandler() {
    this.router.navigate(['/pairings/create', {firstClusterId: this.cluster.id}]);
  }

  createPolicyClickHandler() {
    this.router.navigate(['/policies/create']);
  }
}
