import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { loadPairings } from '../../actions/pairing.action';
import { Store } from '@ngrx/store';
import * as fromRoot from '../../reducers';
import { Pairing } from '../../models/pairing.model';
import { Observable } from 'rxjs/Observable';
import { getAllPairings } from '../../selectors/pairing.selector';

@Component({
  selector: 'dlm-pairings',
  templateUrl: './pairings.component.html',
  styleUrls: ['./pairings.component.scss']
})
export class PairingsComponent implements OnInit {

  pairings$: Observable<Pairing[]>;

  constructor(
    private store: Store<fromRoot.State>,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.pairings$ = store.select(getAllPairings);
  }

  ngOnInit() {
    this.store.dispatch(loadPairings());
  }

  createPairingHandler() {
    this.router.navigate(['create'], {relativeTo: this.route});
  };

  onUnpair(pairingId: string) {
    console.log('Unpair ' + pairingId);
  }
}
